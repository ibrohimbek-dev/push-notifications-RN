import { StatusBar } from "expo-status-bar";
import { Alert, Button, Platform, StyleSheet, View } from "react-native";
import * as Notifications from "expo-notifications";
import { useEffect } from "react";

Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowBanner: true,
		shouldPlaySound: true,
		shouldSetBadge: false,
	}),
});

export default function App() {
	useEffect(() => {
		async function configurePushNotifications() {
			try {
				// Get current permissions
				const { status: existingStatus } =
					await Notifications.getPermissionsAsync();
				let finalStatus = existingStatus;

				// Request if not granted
				if (existingStatus !== "granted") {
					const { status } = await Notifications.requestPermissionsAsync();
					finalStatus = status;
				}

				// Exit if permission not granted
				if (finalStatus !== "granted") {
					Alert.alert(
						"Permission required",
						"Please enable notifications in settings to receive push notifications.",
						[
							{ text: "Cancel", style: "cancel" },
							{
								text: "Open Settings",
								onPress: () => Linking.openSettings(),
							},
						]
					);
					return;
				}

				// Get push token
				const pushTokenData = await Notifications.getExpoPushTokenAsync();
				console.log("Push Token:", pushTokenData);

				// Android channel setup
				if (Platform.OS === "android") {
					await Notifications.setNotificationChannelAsync("default", {
						name: "default",
						importance: Notifications.AndroidImportance.MAX,
						vibrationPattern: [0, 250, 250, 250],
						lightColor: "#FF231F7C",
					});
				}
			} catch (error) {
				console.error("Error configuring push notifications:", error);
			}
		}

		configurePushNotifications();
	}, []);

	useEffect(() => {
		const subsOne = Notifications.addNotificationReceivedListener(
			(recieved) => {
				// console.log("NOTIFICATION RECIEVED RECIEVED =>", recieved);
				const recievedData = recieved.request.content.data.userName;

				// console.log("recievedData =>", recievedData);
			}
		);

		const subsTwo = Notifications.addNotificationResponseReceivedListener(
			(response) => {
				// console.log("NOTIFICATION RESPONSE RECIEVED =>", response);
				const responseData =
					response.notification.request.content.data.userName;

				// console.log("responseData =>", responseData);
			}
		);

		return () => {
			subsOne.remove();
			subsTwo.remove();
		};
	}, []);

	async function requestNotificationPermissions() {
		const { status } = await Notifications.requestPermissionsAsync();

		if (status !== "granted") {
			Alert.alert(
				"Permission required",
				"You need to enable notifications for this app to work properly.",
				[
					{
						text: "Cancel",
						style: "cancel",
					},
					{
						text: "Open Settings",
						onPress: () => Linking.openSettings(),
					},
				]
			);
			return false;
		}
		return true;
	}

	const scheduleNotificationHandler = async () => {
		try {
			await Notifications.scheduleNotificationAsync({
				content: {
					title: "My first local notification",
					body: "This is the body of the notification.",
					data: { userName: "Ibrohimbek" },
				},
				trigger: { seconds: 5 },
			});
			console.log("Notification scheduled!");
		} catch (error) {
			console.error("Error scheduling notification:", error);
		}
	};

	function sendPushNotificationHandler() {
		fetch("https://exp.host/--/api/v2/push/send", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},

			body: JSON.stringify({
				to: "ExponentPushToken[.....]",
				title: "Test - sent from a device!",
				body: "This is a test",
			}),
		});
	}

	return (
		<View style={styles.container}>
			<Button
				title="Schedule Notification"
				onPress={scheduleNotificationHandler}
			/>
			<Button
				title="Send Push Notification"
				onPress={sendPushNotificationHandler}
			/>
			<StatusBar style="auto" />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
		alignItems: "center",
		justifyContent: "center",
	},
});
