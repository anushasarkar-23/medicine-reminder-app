import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { Medication } from "./storage";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotificationsAsync(): Promise<
  string | null
> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.warn("Notification permissions not granted!");
      return null;
    }

    // For local notifications, we don't need a push token
    // Just set up the notification channel for Android
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#6366F1",
      });
    }

    return "local-notifications-enabled";
  } catch (error) {
    console.error("Error setting up notifications:", error);
    return null;
  }
}

export async function scheduleMedicationReminder(
  medication: Medication
): Promise<string[] | undefined> {
  if (!medication.reminderEnabled || !medication.times || medication.times.length === 0) {
    return;
  }

  try {
    const identifiers: string[] = [];

    for (const time of medication.times) {
      const [hours, minutes] = time.split(":").map(Number);

      // Compute next occurrence for today at the exact scheduled time
      const now = new Date();
      const next = new Date();
      next.setSeconds(0, 0);
      next.setHours(hours, minutes, 0, 0);

      // If the time for today has already passed, move to tomorrow
      if (next <= now) {
        next.setDate(next.getDate() + 1);
      }

      // Schedule a one-off notification for the next exact occurrence
      // Using a Date trigger ensures it fires at the exact minute (subject to OS policies)
      const oneOffId = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Medication Reminder",
          body: `Time to take ${medication.name} (${medication.dosage})`,
          data: { medicationId: medication.id },
        },
        trigger: next,
      });
      identifiers.push(oneOffId);

      // Also schedule the daily repeating reminder going forward
      const repeatingId = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Medication Reminder",
          body: `Time to take ${medication.name} (${medication.dosage})`,
          data: { medicationId: medication.id },
        },
        trigger: {
          hour: hours,
          minute: minutes,
          repeats: true,
        },
      });
      identifiers.push(repeatingId);
    }
    console.log(`Scheduled ${identifiers.length} reminders for ${medication.name}.`);
    return identifiers;
  } catch (error) {
    console.error("Error scheduling medication reminder:", error);
    return undefined;
  }
}

export async function scheduleRefillReminder(
  medication: Medication
): Promise<string | undefined> {
  if (!medication.refillReminder) return;

  try {
    // Schedule a notification only if the supply is at or below the threshold
    if (medication.currentSupply <= medication.refillAt) {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Refill Reminder",
          body: `Your ${medication.name} supply is running low. Current supply: ${medication.currentSupply}`,
          data: { medicationId: medication.id, type: "refill" },
        },
        trigger: null, // Shows immediately
      });
      return identifier;
    }
    return undefined;
  } catch (error) {
    console.error("Error scheduling refill reminder:", error);
    return undefined;
  }
}

export async function cancelMedicationReminders(
  medicationId: string
): Promise<void> {
  try {
    const scheduledNotifications =
      await Notifications.getAllScheduledNotificationsAsync();

    for (const notification of scheduledNotifications) {
      const data = notification.content.data as {
        medicationId?: string;
      } | null;

      // Only cancel notifications that match the medication ID
      if (data?.medicationId === medicationId) {
        await Notifications.cancelScheduledNotificationAsync(
          notification.identifier
        );
      }
    }
    console.log(`Canceled reminders for medication ID: ${medicationId}`);
  } catch (error) {
    console.error("Error canceling medication reminders:", error);
  }
}

export async function updateMedicationReminders(
  medication: Medication
): Promise<void> {
  try {
    // First, cancel any existing reminders for this medication
    await cancelMedicationReminders(medication.id);

    // Then, schedule the new reminders
    await scheduleMedicationReminder(medication);
    await scheduleRefillReminder(medication);
    console.log(`Updated all reminders for ${medication.name}.`);
  } catch (error) {
    console.error("Error updating medication reminders:", error);
  }
}
