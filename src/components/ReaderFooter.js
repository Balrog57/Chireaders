
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ReaderFooter = ({
    visible,
    onNext,
    onPrev,
    onChapters,
    hasNext,
    hasPrev,
    theme
}) => {
    const insets = useSafeAreaInsets();
    const translateY = useSharedValue(100);
    const opacity = useSharedValue(0);

    useEffect(() => {
        if (visible) {
            translateY.value = withTiming(0, {
                duration: 250,
                easing: Easing.out(Easing.cubic),
            });
            opacity.value = withTiming(1, { duration: 150 });
        } else {
            translateY.value = withTiming(100, {
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
                    paddingBottom: insets.bottom,
                    backgroundColor: theme.bar,
                    borderTopColor: theme.text + '20'
                }
            ]}
        >
            <View style={styles.content}>
                <TouchableOpacity
                    onPress={onPrev}
                    disabled={!hasPrev}
                    style={[styles.button, !hasPrev && styles.disabled]}
                    accessibilityLabel="Chapitre précédent"
                    accessibilityRole="button"
                    accessibilityHint="Naviguer vers le chapitre précédent"
                >
                    <Ionicons name="chevron-back" size={28} color={hasPrev ? theme.icon : theme.text + '50'} />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={onChapters}
                    style={styles.button}
                    accessibilityLabel="Liste des chapitres"
                    accessibilityRole="button"
                    accessibilityHint="Afficher la liste complète des chapitres"
                >
                    <Ionicons name="list" size={28} color={theme.icon} />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={onNext}
                    disabled={!hasNext}
                    style={[styles.button, !hasNext && styles.disabled]}
                    accessibilityLabel="Chapitre suivant"
                    accessibilityRole="button"
                    accessibilityHint="Naviguer vers le chapitre suivant"
                >
                    <Ionicons name="chevron-forward" size={28} color={hasNext ? theme.icon : theme.text + '50'} />
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        borderTopWidth: 1,
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    content: {
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingHorizontal: 16,
    },
    button: {
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 60,
    },
    disabled: {
        opacity: 0.5,
    },
});

export default ReaderFooter;
