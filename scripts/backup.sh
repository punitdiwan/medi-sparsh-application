#!/bin/bash
set -e

# ========= REQUIRED ENV VALIDATION =========
# : "${PGPASSWORD:?Missing PGPASSWORD}"
# : "${PGHOST:?Missing PGHOST}"
# : "${PGPORT:?Missing PGPORT}"
# : "${PGUSER:?Missing PGUSER}"
# : "${PGDATABASE:?Missing PGDATABASE}"

# : "${DO_ACCESS_KEY:?Missing DO_ACCESS_KEY}"
# : "${DO_SECRET_KEY:?Missing DO_SECRET_KEY}"
# : "${BUCKET_NAME:?Missing BUCKET_NAME}"
# : "${SPACES_ENDPOINT:?Missing SPACES_ENDPOINT}"

export PGPASSWORD=12DVqdXxtLLhKtr0
export DO_ACCESS_KEY=DO00Z6BQLU76298YFU2G
export DO_SECRET_KEY=l3XB9ck+U9tvwixHGxMopTFVWSJlwxxpOlNJhvlQhIo
# ========= DATABASE CONFIG =========
# HOST="$PGHOST"
# PORT="$PGPORT"
# USER="$PGUSER"
# DB="$PGDATABASE"

HOST=aws-1-ap-south-1.pooler.supabase.com
PORT=6543
USER=postgres.ivmgtyrntujlbrjiryna
DB=postgres

BUCKET_NAME=YOUR_BUCKET_NAME
SPACES_ENDPOINT=https://ap-south-1.digitaloceanspaces.com
# ========= BACKUP DIR =========
BACKUP_DIR="backup"
mkdir -p "$BACKUP_DIR"

# ========= ORG PARAM =========
ORG_ID="$1"
[ -z "$ORG_ID" ] && { echo "❌ ORG_ID required"; exit 1; }

# ========= ORG NAME =========
ORG_NAME=$(psql -h "$HOST" -p "$PORT" -U "$USER" -d "$DB" -t -A \
  -c "SELECT name FROM public.organization WHERE id='$ORG_ID';")

[ -z "$ORG_NAME" ] && { echo "❌ Organization not found"; exit 1; }

SAFE_NAME=$(echo "$ORG_NAME" | tr ' ' '_' | tr -cd '[:alnum:]_')
ORG_DIR="$BACKUP_DIR/$SAFE_NAME"
mkdir -p "$ORG_DIR"

echo "🚀 Backing up organization: $ORG_NAME"

# =====================================================
# ✅ 1️⃣ ORGANIZATION TABLE (EXPLICIT)
# =====================================================
psql -h "$HOST" -p "$PORT" -U "$USER" -d "$DB" \
  -c "\copy (
        SELECT * FROM public.organization
        WHERE id='$ORG_ID'
      ) TO '$ORG_DIR/organization.csv' CSV HEADER;"

# =====================================================
# ✅ 2 MEMBER TABLE BACKUP
# =====================================================
psql -h "$HOST" -p "$PORT" -U "$USER" -d "$DB" \
  -c "\copy (
        SELECT *
        FROM public.member
        WHERE \"organizationId\"='$ORG_ID'
      ) TO '$ORG_DIR/member.csv' CSV HEADER;"

# =====================================================
# ✅ 3 USER TABLE BACKUP
# =====================================================
USER_IDS=$(psql -h "$HOST" -p "$PORT" -U "$USER" -d "$DB" -t -A \
  -c "SELECT DISTINCT \"userId\"
      FROM public.member
      WHERE \"organizationId\" = '$ORG_ID';")


if [ -n "$USER_IDS" ]; then
  USER_IDS_SQL=$(echo "$USER_IDS" | awk '{printf "'\''%s'\'',",$0}' | sed 's/,$//')

  # User table
  psql -h "$HOST" -p "$PORT" -U "$USER" -d "$DB" \
    -c "\copy (
          SELECT *
          FROM public.\"user\"
          WHERE id IN ($USER_IDS_SQL)
        ) TO '$ORG_DIR/users.csv' CSV HEADER;"

  # =====================================================
  # ✅ 4 ACCOUNT TABLE BACKUP (via userId)
  # =====================================================
  psql -h "$HOST" -p "$PORT" -U "$USER" -d "$DB" \
    -c "\copy (
          SELECT *
          FROM public.account
          WHERE \"userId\" IN ($USER_IDS_SQL)
        ) TO '$ORG_DIR/accounts.csv' CSV HEADER;"

else
  echo "⚠️ No users found for this organization"
fi

# =====================================================
# 5 Organization role table (organization_id)
# =====================================================
echo "🚀 Backing up organization_role table"

ORG_ROLE_COUNT=$(psql -h "$HOST" -p "$PORT" -U "$USER" -d "$DB" -t -A \
  -c "SELECT COUNT(*) FROM public.organization_role WHERE organization_id='$ORG_ID';")

if [ "$ORG_ROLE_COUNT" -gt 0 ]; then
  echo "  ✅ Exporting organization_role ($ORG_ROLE_COUNT rows)"
  psql -h "$HOST" -p "$PORT" -U "$USER" -d "$DB" \
    -c "\copy (
          SELECT * FROM public.organization_role
          WHERE organization_id='$ORG_ID'
        ) TO '$ORG_DIR/organization_role.csv' CSV HEADER;"
else
  echo "⚠️ No organization_role data found"
fi

# =====================================================
# 6 Loop through all other tables (hospital_id based)
# =====================================================
psql -h "$HOST" -p "$PORT" -U "$USER" -d "$DB" -t -A \
  -c "SELECT tablename FROM pg_tables WHERE schemaname='public';" |
while read -r TABLE; do

  # Skip organization_role (already backed up)
  if [ "$TABLE" = "organization_role" ]; then
    continue
  fi

  # Check if table has hospital_id
  HAS_HOSPITAL=$(psql -h "$HOST" -p "$PORT" -U "$USER" -d "$DB" -t -A \
    -c "SELECT 1 FROM information_schema.columns
        WHERE table_schema='public'
        AND table_name='$TABLE'
        AND column_name='hospital_id'
        LIMIT 1;")

  if [ "$HAS_HOSPITAL" = "1" ]; then
    ROW_COUNT=$(psql -h "$HOST" -p "$PORT" -U "$USER" -d "$DB" -t -A \
      -c "SELECT COUNT(*) FROM public.\"$TABLE\" WHERE hospital_id='$ORG_ID';")

    if [ "$ROW_COUNT" -gt 0 ]; then
      echo "  ✅ Exporting $TABLE ($ROW_COUNT rows)"
      psql -h "$HOST" -p "$PORT" -U "$USER" -d "$DB" \
        -c "\copy (
              SELECT * FROM public.\"$TABLE\"
              WHERE hospital_id='$ORG_ID'
            ) TO '$ORG_DIR/$TABLE.csv' CSV HEADER;"
    fi
  else
    echo "  ⏭️ Skipping $TABLE (no hospital_id)"
  fi
done

# =====================================================
# 📦 ZIP + UPLOAD (UNCHANGED)
# =====================================================
CSV_COUNT=$(find "$ORG_DIR" -name "*.csv" | wc -l)

if [ "$CSV_COUNT" -gt 0 ]; then
  TIMESTAMP=$(date +%Y-%m-%d)
  ZIP_FILE="$BACKUP_DIR/${SAFE_NAME}_${TIMESTAMP}.zip"

  (cd "$BACKUP_DIR" && zip -r "$(basename "$ZIP_FILE")" "$SAFE_NAME" >/dev/null)

  echo "☁️ Uploading to DigitalOcean Spaces"

  # spaces-cli up \
  #   -s "$BUCKET_NAME" \
  #   -r "$SPACES_REGION" \
  #   -i "$DO_ACCESS_KEY" \
  #   -k "$DO_SECRET_KEY" \
  #   -t "medisparsh/${SAFE_NAME}/${TIMESTAMP}" \
  #   "$ZIP_FILE"
else
  echo "⏭️ No data found"
fi

echo "🎉 Backup completed for $ORG_NAME"
