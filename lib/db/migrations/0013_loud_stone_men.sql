ALTER TABLE "team" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "team_member" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "public"."team" SET SCHEMA "auth";
--> statement-breakpoint
ALTER TABLE "public"."team_member" SET SCHEMA "auth";
--> statement-breakpoint
ALTER TABLE "auth"."invitation" ADD CONSTRAINT "invitation_teamId_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "auth"."team"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."session" ADD CONSTRAINT "session_activeTeamId_team_id_fk" FOREIGN KEY ("active_team_id") REFERENCES "auth"."team"("id") ON DELETE no action ON UPDATE no action;