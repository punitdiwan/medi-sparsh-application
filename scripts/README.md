# Admin User Creation CLI

This CLI tool helps you create a hospital and an admin user for the Medi-Sparsh application.

## Usage

### Interactive Mode

Run the CLI without arguments to enter interactive mode:

```bash
npm run create-admin
```

The CLI will prompt you for:
- Hospital name
- Hospital slug (auto-generated from name if not provided)
- Admin user name
- Admin user email
- Admin user password (minimum 8 characters)
- Admin user mobile number
- Admin user gender (male/female/other)

### Command-Line Arguments Mode

You can also provide all information via command-line arguments:

```bash
npm run create-admin -- \
  --hospital-name "City General Hospital" \
  --hospital-slug "city-general" \
  --admin-name "Dr. John Doe" \
  --admin-email "admin@cityhospital.com" \
  --admin-password "SecurePass123" \
  --admin-mobile "+1234567890" \
  --admin-gender "male"
```

### Options

| Option | Description | Required |
|--------|-------------|----------|
| `--hospital-name` | Hospital name | Yes |
| `--hospital-slug` | Hospital slug (URL-friendly identifier) | No (auto-generated) |
| `--admin-name` | Admin user full name | Yes |
| `--admin-email` | Admin user email address | Yes |
| `--admin-password` | Admin user password (min 8 chars) | Yes |
| `--admin-mobile` | Admin user mobile number | Yes |
| `--admin-gender` | Admin user gender (male/female/other) | No (default: male) |

### Help

View help information:

```bash
npm run create-admin -- --help
```

## Examples

### Example 1: Interactive Mode

```bash
$ npm run create-admin

🏥 Hospital Setup

Hospital Name: Springfield Medical Center
Hospital Slug (default: springfield-medical-center): 

👤 Admin User Setup

Admin Name: Dr. Sarah Johnson
Admin Email: sarah.johnson@springfield.com
Admin Password (min 8 characters): ********
Admin Mobile Number: +1-555-0123
Admin Gender (male/female/other, default: male): female

🔄 Creating hospital and admin user...

✅ Hospital created: Springfield Medical Center (springfield-medical-center)
✅ User created: Dr. Sarah Johnson (sarah.johnson@springfield.com)
✅ Admin role assigned to user in hospital
✅ Staff record created for admin

✨ Setup completed successfully!

📋 Summary:
   Hospital: Springfield Medical Center
   Slug: springfield-medical-center
   Admin: Dr. Sarah Johnson
   Email: sarah.johnson@springfield.com
   Role: admin

🔗 You can now login with the admin credentials.
```

### Example 2: Command-Line Arguments

```bash
npm run create-admin -- \
  --hospital-name "Metro Health Clinic" \
  --admin-name "Dr. Michael Chen" \
  --admin-email "michael@metrohealth.com" \
  --admin-password "Admin@2024" \
  --admin-mobile "+1-555-9876"
```

## What It Does

The CLI performs the following operations:

1. **Creates Hospital (Organization)**
   - Inserts a new organization record with the provided name and slug
   - Generates a unique identifier for the hospital

2. **Creates Admin User**
   - Creates a user account in the auth system
   - Hashes the password securely using bcrypt
   - Sets email as verified

3. **Assigns Admin Role**
   - Creates a member record linking the user to the hospital
   - Assigns the "admin" role to the user

4. **Creates Staff Record**
   - Creates a staff record with the user's details
   - Sets department as "Administration"
   - Links the staff to the hospital

## Validation

The CLI includes validation for:
- **Email format**: Must be a valid email address
- **Password strength**: Minimum 8 characters
- **Duplicate checking**: Prevents creating hospitals or users that already exist

## Error Handling

If any error occurs during the process:
- The CLI will display a clear error message
- The operation will be rolled back (no partial data)
- Exit code 1 will be returned

## Notes

- The admin user will have full access to the hospital's data and settings
- The hospital slug must be unique across all hospitals
- The admin email must be unique across all users
- Passwords are securely hashed before storage
- The CLI requires a database connection to be configured

## Troubleshooting

### "Hospital with slug already exists"
The hospital slug is already taken. Choose a different slug or modify the existing hospital.

### "User with email already exists"
The email address is already registered. Use a different email or reset the existing user's password.

### Database connection errors
Ensure your database is running and the connection string in `.env` is correct.
