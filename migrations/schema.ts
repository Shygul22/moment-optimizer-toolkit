import { pgTable, foreignKey, serial, varchar, boolean, timestamp, integer, numeric, text, index, jsonb, unique } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const tasks = pgTable("tasks", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	title: varchar({ length: 500 }).notNull(),
	priority: varchar({ length: 10 }).default('medium').notNull(),
	completed: boolean().default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	dueDate: timestamp("due_date", { mode: 'string' }),
	estimatedDuration: integer("estimated_duration"),
	complexity: integer().default(3),
	impact: integer().default(3),
	context: varchar({ length: 50 }).default('work'),
	energyLevel: varchar("energy_level", { length: 10 }).default('medium'),
	aiScore: numeric("ai_score", { precision: 5, scale:  2 }),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "tasks_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const timeSessions = pgTable("time_sessions", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	taskId: integer("task_id"),
	startTime: timestamp("start_time", { mode: 'string' }).notNull(),
	endTime: timestamp("end_time", { mode: 'string' }),
	duration: integer(),
	sessionType: varchar("session_type", { length: 20 }).default('focus').notNull(),
	energyLevel: integer("energy_level").default(3),
	focusQuality: integer("focus_quality").default(3),
	interruptions: integer().default(0),
	notes: text(),
	completed: boolean().default(false).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "time_sessions_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.taskId],
			foreignColumns: [tasks.id],
			name: "time_sessions_task_id_tasks_id_fk"
		}).onDelete("set null"),
]);

export const sessions = pgTable("sessions", {
	sid: varchar().primaryKey().notNull(),
	sess: jsonb().notNull(),
	expire: timestamp({ mode: 'string' }).notNull(),
}, (table) => [
	index("IDX_session_expire").using("btree", table.expire.asc().nullsLast().op("timestamp_ops")),
]);

export const coachingBookings = pgTable("coaching_bookings", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	title: varchar().notNull(),
	description: text(),
	preferredDate: timestamp("preferred_date", { mode: 'string' }).notNull(),
	preferredTime: varchar("preferred_time").notNull(),
	duration: integer().default(30),
	status: varchar().default('pending').notNull(),
	adminNotes: text("admin_notes"),
	meetingLink: text("meeting_link"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "coaching_bookings_user_id_users_id_fk"
		}),
]);

export const availabilitySlots = pgTable("availability_slots", {
	id: serial().primaryKey().notNull(),
	date: timestamp({ mode: 'string' }).notNull(),
	startTime: varchar("start_time").notNull(),
	endTime: varchar("end_time").notNull(),
	isBooked: boolean("is_booked").default(false),
	bookingId: integer("booking_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.bookingId],
			foreignColumns: [coachingBookings.id],
			name: "availability_slots_booking_id_coaching_bookings_id_fk"
		}),
]);

export const users = pgTable("users", {
	id: varchar().primaryKey().notNull(),
	email: varchar(),
	firstName: varchar("first_name"),
	lastName: varchar("last_name"),
	profileImageUrl: varchar("profile_image_url"),
	role: varchar().default('user').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("users_email_unique").on(table.email),
]);

export const productivityMetrics = pgTable("productivity_metrics", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	date: timestamp({ mode: 'string' }).notNull(),
	totalFocusTime: integer("total_focus_time").default(0),
	averageFocusQuality: numeric("average_focus_quality", { precision: 3, scale:  2 }),
	tasksCompleted: integer("tasks_completed").default(0),
	productivityScore: numeric("productivity_score", { precision: 5, scale:  2 }),
	goalAchievement: numeric("goal_achievement", { precision: 5, scale:  2 }),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "productivity_metrics_user_id_users_id_fk"
		}).onDelete("cascade"),
]);
