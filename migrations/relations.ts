import { relations } from "drizzle-orm/relations";
import { users, tasks, timeSessions, coachingBookings, availabilitySlots, productivityMetrics } from "./schema";

export const tasksRelations = relations(tasks, ({one, many}) => ({
	user: one(users, {
		fields: [tasks.userId],
		references: [users.id]
	}),
	timeSessions: many(timeSessions),
}));

export const usersRelations = relations(users, ({many}) => ({
	tasks: many(tasks),
	timeSessions: many(timeSessions),
	coachingBookings: many(coachingBookings),
	productivityMetrics: many(productivityMetrics),
}));

export const timeSessionsRelations = relations(timeSessions, ({one}) => ({
	user: one(users, {
		fields: [timeSessions.userId],
		references: [users.id]
	}),
	task: one(tasks, {
		fields: [timeSessions.taskId],
		references: [tasks.id]
	}),
}));

export const coachingBookingsRelations = relations(coachingBookings, ({one, many}) => ({
	user: one(users, {
		fields: [coachingBookings.userId],
		references: [users.id]
	}),
	availabilitySlots: many(availabilitySlots),
}));

export const availabilitySlotsRelations = relations(availabilitySlots, ({one}) => ({
	coachingBooking: one(coachingBookings, {
		fields: [availabilitySlots.bookingId],
		references: [coachingBookings.id]
	}),
}));

export const productivityMetricsRelations = relations(productivityMetrics, ({one}) => ({
	user: one(users, {
		fields: [productivityMetrics.userId],
		references: [users.id]
	}),
}));