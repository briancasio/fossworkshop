import React, { useEffect, useState} from 'react';
import {StyleSheet, Text, View, FlatList, ActivityIndicator, TouchableOpacity} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";


type EventItem = {
  id: string;
  title: string;
  time: string;
  location: string;
  description: string;
}

export default function Index() {
  const [isLoading, setLoading] = useState(true);
  const[data, setData] = useState<EventItem[]>([]);

  useEffect(() => {
    // ========================================
    // GOOGLE CALENDAR API CONFIGURATION
    // ========================================
    // API Key: Used to authenticate requests to Google Calendar API
    // IMPORTANT: For production apps, consider using environment variables
    // and restricting this API key in Google Cloud Console to prevent unauthorized use
    const API_KEY = "AIzaSyBDmQ5gCcK0WuXTVCDJAi0K66JYxRr_K7M"; 
    
    // Calendar ID: Unique identifier for the specific Google Calendar we want to fetch events from
    // This is typically found in the calendar settings under "Integrate calendar"
    const CALENDAR_ID = "735cf2050bcbd5c3ea0bf241ba602b8cc938016f73a8ed44edb81cc731d2ea9f@group.calendar.google.com";

    // ========================================
    // BUILD API REQUEST URL
    // ========================================
    // Construct the Google Calendar API endpoint with query parameters:
    // - encodeURIComponent(CALENDAR_ID): Safely encode the calendar ID for use in URL
    // - key=${API_KEY}: Authentication parameter
    // - orderBy=startTime: Sort events chronologically by their start time
    // - singleEvents=true: Expand recurring events into individual instances
    const apiURL = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events?key=${API_KEY}&orderBy=startTime&singleEvents=true`;

    // ========================================
    // FETCH EVENTS FROM GOOGLE CALENDAR
    // ========================================
    fetch(apiURL)
    .then((response)=> response.json())
    .then((json) => {
      // ========================================
      // ERROR HANDLING
      // ========================================
      // Check if the API returned an error (e.g., invalid API key, calendar not found, permission denied)
      if (json.error) {
        console.error("Google Calendar API Error:", json.error);
        setLoading(false); // Stop the loading indicator
        return; // Exit early to prevent further processing
      }

      // ========================================
      // EXTRACT EVENTS FROM RESPONSE
      // ========================================
      // The Google Calendar API returns events in a 'items' array
      // If no events exist, default to an empty array to prevent errors
      const items = json.items || [];

      // ========================================
      // TRANSFORM GOOGLE CALENDAR DATA
      // ========================================
      // Map each Google Calendar event to our app's EventItem structure
      // This ensures compatibility with our existing UI components
      const mappedData = items.map((item: any) => {
        // Extract the start time/date from the event
        // dateTime: Used for events with specific times (e.g., "2025-12-15T14:00:00-07:00")
        // date: Used for all-day events (e.g., "2025-12-15")
        const start = item.start.dateTime || item.start.date;
        
        // Convert the ISO 8601 date string to a JavaScript Date object
        // This allows us to format the time according to our needs
        const dateObj = new Date(start);
        
        // ========================================
        // FORMAT TIME STRING
        // ========================================
        // Check if this is an all-day event (only has 'date', no 'dateTime')
        // - All-day events: Display "All Day"
        // - Timed events: Format as 12-hour time with AM/PM (e.g., "02:00 PM")
        const timeString = item.start.date 
          ? "All Day" 
          : dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        // ========================================
        // CREATE EVENT ITEM OBJECT
        // ========================================
        // Map Google Calendar fields to our EventItem type:
        return {
          id: item.id,                              // Unique event identifier from Google Calendar
          title: item.summary || "No Title",        // Event name (summary in Google Calendar API)
          time: timeString,                         // Formatted time string (created above)
          location: item.location || "TBD",         // Event location (defaults to "TBD" if not specified)
          description: item.description || "",      // Event description/details (empty string if not provided)
        };
      });

      // ========================================
      // UPDATE STATE WITH FETCHED DATA
      // ========================================
      setData(mappedData);    // Store the transformed events in state
      setLoading(false);      // Hide the loading indicator
    })
    .catch((error) => {
      // ========================================
      // NETWORK ERROR HANDLING
      // ========================================
      // Catch any network errors (e.g., no internet connection, API endpoint unreachable)
      console.error("Error fetching events:", error);
      setLoading(false); // Ensure loading indicator is hidden even if request fails
    });
  }, []); // Empty dependency array: run this effect only once when component mounts

  if(isLoading) {
    return(
      <View>
        <ActivityIndicator size = "large" color="#D25100" />
        <Text>Loading Events...</Text>
      </View>
    )
  }
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}> SHPE Conference 2026</Text>
      <FlatList
        data={data}
        keyExtractor = {(item) => item.id }
        renderItem = {({item}) => (
          <TouchableOpacity style={styles.card}onPress={() => {
            router.push({
              pathname: "/details/[id]",
              params: {
                id: item.id,
                title: item.title,
                location: item.location,
                description: item.description
              }
            })
          }}>
            <View style={styles.row}>
              <Text style={styles.time}>{item.time}</Text>
              <View style={styles.info}>
                <Text style = {styles.title}>{item.title}</Text>
                <Text style = {styles.location}>{item.location}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}></FlatList>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F5F5F5', padding: 10},
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center'},
  header: {fontSize: 24, fontWeight: 'bold', color: '#002649', marginBottom: 15},
  card: {backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 10, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2},
    shadowOpacity: 0.1, elevation: 3
  },
  row: { flexDirection: 'row', alignItems: 'center'},
  time: { fontWeight: 'bold', color: '#D24100', width: 75},
  info: {flex: 1},
  title: {fontWeight: 'bold', fontSize: 16, color: '#333'},
  location: {color: 'gray', fontSize: 12, marginTop: 4}
})
