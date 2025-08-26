import React, { useState, useRef } from 'react';
import { PanResponder } from 'react-native';

import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Animated,
  Dimensions,
  Keyboard,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const quotes = [
  "Believe you can and you're halfway there.",
  "Every morning is a new beginning.",
  "Stay positive, work hard, make it happen.",
  "You are capable of amazing things.",
  "Today is your day to shine.",
  // Add more quotes here
];

const MainPage: React.FC = () => {
  const [userName, setUserName] = useState('');
  const [inputName, setInputName] = useState('');
  const [screen, setScreen] = useState<'input' | 'greeting' | 'quote'>('input');
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [quote, setQuote] = useState('');

  const greetingOpacity = useRef(new Animated.Value(0)).current;
  const greetingTranslate = useRef(new Animated.Value(30)).current;
  const quoteOpacity = useRef(new Animated.Value(0)).current;
  const quoteTranslate = useRef(new Animated.Value(30)).current;
  const positionY = useRef(new Animated.Value(0)).current; // swipe


  const handleNameSubmit = () => {
    if (!inputName.trim()) return;
    setUserName(inputName.trim());
    Keyboard.dismiss();
    setScreen('greeting');
    animateGreeting();
  };

  const animateGreeting = () => {
    greetingOpacity.setValue(0);
    greetingTranslate.setValue(30);

    Animated.parallel([
      Animated.timing(greetingOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(greetingTranslate, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start(() => {
      startTypingAnimation(`Good Morning, ${inputName.trim()}`);
    });
  };

  const startTypingAnimation = (text: string) => {
    let i = 0;
    setIsTyping(true);
    const type = () => {
      if (i <= text.length) {
        setDisplayedText(text.slice(0, i));
        i++;
        setTimeout(type, 90);
      } else {
        setIsTyping(false);
        // After typing is done, show quote screen after short delay
        setTimeout(showQuoteScreen, 1000);
      }
    };
    type();
  };

  const showQuoteScreen = () => {
    // Pick a random quote
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setQuote(randomQuote);
    setScreen('quote');
    animateQuote();
  };

  const animateQuote = () => {
    quoteOpacity.setValue(0);
    quoteTranslate.setValue(30);

    Animated.parallel([
      Animated.timing(quoteOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(quoteTranslate, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const InputScreen = () => (
    <View style={styles.inputScreen}>
      <Text style={[styles.promptText, { fontSize: 50 }]}>Welcome, Early Bird</Text>
      <Text style={styles.promptText}>What would you like to be called?</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Enter your name"
          placeholderTextColor="#7c5a44"
          value={inputName}
          onChangeText={setInputName}
          onSubmitEditing={handleNameSubmit}
          returnKeyType="done"
          autoFocus
        />
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleNameSubmit}
          disabled={!inputName.trim()}
        >
          <Text style={styles.submitText}>✓</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const GreetingScreen = () => (
    <Animated.View
      style={[
        styles.greetingContainer,
        {
          opacity: greetingOpacity,
          transform: [{ translateY: greetingTranslate }],
        },
      ]}
    >
      <Text style={styles.greetingText}>
        {displayedText}
        {isTyping && <Text style={styles.cursor}>|</Text>}
      </Text>
    </Animated.View>
  );

  const QuoteScreen = () => (
    <Animated.View
      style={[
        styles.quoteContainer,
        {
          opacity: quoteOpacity,
          transform: [{ translateY: quoteTranslate }],
        },
      ]}
    >
      <Text style={styles.quoteText}>"{quote}"</Text>
    </Animated.View>
  );

  //arrows
  const ArrowUp = () => (
  <View style={styles.arrowContainerTop}>
    <Text style={styles.arrow}>▲</Text>
  </View>
);

const ArrowDown = () => (
  <View style={styles.arrowContainerBottom}>
    <Text style={styles.arrow}>▼</Text>
  </View>
);

// Add PanResponder
const panResponder = useRef(
  PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dy) > 10;
    },
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dy > 0) {
        // Track downward drag for smooth transition
        positionY.setValue(gestureState.dy);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dy > 100) {
        // User swiped down enough to trigger transition
        Animated.timing(positionY, {
          toValue: height, // slide entire view off screen downwards
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          // After animation completes, change screen & reset position
          if (screen === 'quote') {
            setScreen('greeting');
            animateGreeting();
          } else if (screen === 'greeting') {
            setScreen('input');
          }
          positionY.setValue(0);
        });
      } else {
        // Not enough swipe, bounce back to original position
        Animated.spring(positionY, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 8,
        }).start();
      }

      // Swipe up logic unchanged
      if (gestureState.dy < -50) {
        if (screen === 'input') {
          handleNameSubmit();
        } else if (screen === 'greeting') {
          showQuoteScreen();
        }
      }
    },
  })
).current;

return (
  <Animated.View
    style={[styles.container, { transform: [{ translateY: positionY }] }]}
    {...panResponder.panHandlers}
  >
    <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

    <LinearGradient
      colors={['#FFF8E1', '#FFE082', '#FFECB3', '#FFF8E1']}
      locations={[0, 0.3, 0.7, 1]}
      start={{ x: 0.5, y: 0.2 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.gradient}
    />

   {/* Show arrows only on the quote screen */}
{screen === 'quote' && <ArrowUp />}

{/* The screen content based on state */}
{screen === 'input' && <InputScreen />}
{screen === 'greeting' && <GreetingScreen />}
{screen === 'quote' && <QuoteScreen />}

{screen === 'quote' && <ArrowDown />}

    <ArrowDown />
  </Animated.View>
);
};

export default MainPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E1',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    width,
    height,
  },
  inputScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  promptText: {
    fontSize: 28,
    color: '#5D4037',
    marginBottom: 30,
    fontWeight: '300',
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 300,
    width: '100%',
  },
  textInput: {
    flex: 1,
    fontSize: 22,
    color: '#4A2C20',
    borderBottomWidth: 2,
    borderBottomColor: '#5D4037',
    paddingVertical: 10,
    paddingHorizontal: 10,
    textAlign: 'center',
  },
  submitButton: {
    marginLeft: 10,
    backgroundColor: 'rgba(93, 64, 55, 0.1)',
    borderRadius: 25,
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitText: {
    fontSize: 22,
    color: '#5D4037',
    fontWeight: 'bold',
  },
  greetingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  greetingText: {
    fontSize: 40,
    color: '#4A2C20',
    fontWeight: '300',
    textAlign: 'center',
    letterSpacing: 1,
  },
  cursor: {
    color: '#4A2C20',
  },
  quoteContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  quoteText: {
    fontSize: 28,
    color: '#5D4037',
    fontStyle: 'italic',
    fontWeight: '400',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
    arrowContainerTop: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  arrowContainerBottom: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  arrow: {
    fontSize: 24,
    color: '#5D4037',
    opacity: 0.5,
  },
});
