CREATE TABLE "productivity_metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"date" timestamp NOT NULL,
	"total_focus_time" integer DEFAULT 0,
	"average_focus_quality" numeric(3, 2),
	"tasks_completed" integer DEFAULT 0,
	"productivity_score" numeric(5, 2),
	"goal_achievement" numeric(5, 2)
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"title" varchar(500) NOT NULL,
	"priority" varchar(10) DEFAULT 'medium' NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"due_date" timestamp,
	"estimated_duration" integer,
	"complexity" integer DEFAULT 3,
	"impact" integer DEFAULT 3,
	"context" varchar(50) DEFAULT 'work',
	"energy_level" varchar(10) DEFAULT 'medium',
	"ai_score" numeric(5, 2)
);
--> statement-breakpoint
CREATE TABLE "time_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"task_id" integer,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp,
	"duration" integer,
	"session_type" varchar(20) DEFAULT 'focus' NOT NULL,
	"energy_level" integer DEFAULT 3,
	"focus_quality" integer DEFAULT 3,
	"interruptions" integer DEFAULT 0,
	"notes" text,
	"completed" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY NOT NULL,
	"email" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "productivity_metrics" ADD CONSTRAINT "productivity_metrics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_sessions" ADD CONSTRAINT "time_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_sessions" ADD CONSTRAINT "time_sessions_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");