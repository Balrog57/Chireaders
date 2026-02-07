import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, TouchableOpacity, StyleSheet } from 'react-native';

/**
 * Bouton coeur flottant pour ajouter/retirer des favoris
 * Apparaît avec animation quand on est sur une page série
 */
const FloatingHeartButton = ({ isActive, onPress }) => {
    const scaleAnim = useRef(new Animated.Value(0)).current;
    
    useEffect(() => {
        // Animation d'apparition
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 4,
            tension: 40,
            useNativeDriver: true
        }).start();
        
        return () => {
            // Animation de disparition
            Animated.timing(scaleAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true
            }).start();
        };
    }, []);
    
    const handlePress = () => {
        // Animation de pression (squeeze effect)
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 0.8,
                duration: 100,
                useNativeDriver: true
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 4,
                useNativeDriver: true
            })
        ]).start();
        
        onPress();
    };
    
    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [{ scale: scaleAnim }]
                }
            ]}
        >
            <TouchableOpacity
                style={[
                    styles.button,
                    isActive && styles.buttonActive
                ]}
                onPress={handlePress}
                activeOpacity={0.8}
            >
                <Ionicons
                    name={isActive ? "heart" : "heart-outline"}
                    size={30}
                    color="white"
                />
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 80, // Au-dessus de la bottom tab bar (environ 60px)
        right: 20,
        zIndex: 1000,
    },
    button: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#666',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8, // Pour Android
    },
    buttonActive: {
        backgroundColor: '#e91e63',
    }
});

export default FloatingHeartButton;
