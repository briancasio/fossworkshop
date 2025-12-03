import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams, useNavigation} from 'expo-router';
import React, { useEffect } from 'react';
import {ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function EventDetails() {
    const params = useLocalSearchParams();
    const { title, description, time, location } = params;
    const navigation = useNavigation();

    useEffect(() => {
        navigation.setOptions({title: params.title});
    }, [params.title]);

    return(
        <View>
            <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color='#002649'/>
                <Text>Back to schedule view</Text>
            </TouchableOpacity>
            <ScrollView>
                <Text>{title}</Text>

                <View>
                    <Ionicons name="time-outline" size={16} color="white" />
                    <Text>{time}</Text>
                </View>
                <Text>{location}</Text>
                <Text>About this session</Text>
                <Text>{description}</Text>

                <TouchableOpacity onPress={() => alert("RSVP Done!")}>
                    <Text>RSVP for this event</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    )


}