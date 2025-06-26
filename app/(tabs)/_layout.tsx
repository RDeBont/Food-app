import { FontAwesome } from '@expo/vector-icons';
import { Tabs } from "expo-router";
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; 

const _layout = () => {
    const insets = useSafeAreaInsets(); 

    return (
        <Tabs
            screenOptions={{
                tabBarShowLabel: false,
                tabBarItemStyle: {
                    width: '100%',
                    height: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                },
                tabBarStyle: {
                    backgroundColor: "#FFFFFF",
                    marginHorizontal: -1,
                    paddingTop: 3,
                    height: 45 + insets.bottom, 
                    paddingBottom: insets.bottom, 
                    position: 'absolute',
                    overflow: 'hidden',
                    borderTopWidth: 3,
                    borderTopColor: '#201E1F',
                }
            }}
        >

            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (

                        <FontAwesome name='home' size={30} color="#201E1F" />
                    )
                }}
            />


            <Tabs.Screen
                name="setting"
                options={{
                    title: 'Settings',
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <FontAwesome name='cog' size={30} color="#201E1F" />
                    )
                }}
            />
        </Tabs>
    )
}

export default _layout