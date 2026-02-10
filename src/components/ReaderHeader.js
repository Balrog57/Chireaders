
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ReaderHeader = ({ visible, title, onBack, onSettings, theme }) => {
    const insets = useSafeAreaInsets();
    const translateY = useSharedValue(-100);
    const opacity = useSharedValue(0);

    useEffect(() => {
        if (visible) {
            translateY.value = withTiming(0, {
                duration: 250,
                easing: Easing.out(Easing.cubic),
            });
            opacity.value = withTiming(1, { duration: 150 });
        } else {
            translateY.value = withTiming(-100, {
                duration: 250,
                easing: Easing.out(Easing.cubic),
            });
            opacity.value = withTiming(0, { duration: 150 });
        }
    }, [visible]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: translateY.value }],
            opacity: opacity.value,
        };
    });

    return (
        <Animated.View
            style={[
                styles.container,
                animatedStyle,
                {
                    paddingTop: insets.top,
                    backgroundColor: theme.bar,
                    borderBottomColor: theme.text + '20'
                }
            ]}
        >
            <View style={styles.content}>
                <TouchableOpacity
                    onPress={onBack}
                    style={styles.button}
                    accessibilityLabel="Retour"
                    accessibilityRole="button"
                    accessibilityHint="Retourne à la bibliothèque"
                >
                    <Ionicons name="arrow-back" size={24} color={theme.icon} />
                </TouchableOpacity>

                <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
                    {title}
                </Text>

                <TouchableOpacity
                    onPress={onSettings}
                    style={styles.button}
                    accessibilityLabel="Paramètres"
                    accessibilityRole="button"
                    accessibilityHint="Ouvre les paramètres de lecture"
                >
                    <Ionicons name="text" size={24} color={theme.icon} />
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        borderBottomWidth: 1,
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    content: {
        height: 56, // Standard app bar height
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    title: {
        flex: 1,
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginHorizontal: 16,
    },
    button: {
        padding: 8,
    },
});

export default ReaderHeader;
