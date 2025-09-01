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
];

const MainPage: React.FC = () => {
  const [userName, setUserName] = useState('');
  const [inputName, setInputName] = useState('');
  const [screen, setScreen] = useState<'input' | 'greeting' | 'quote' | 'journal' | 'todo'>('input');
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [quote, setQuote] = useState('');
  const [gratitude1, setGratitude1] = useState('');
  const [gratitude2, setGratitude2] = useState('');
  const [gratitude3, setGratitude3] = useState('');
  const [todos, setTodos] = useState<{ id: number; text: string; completed: boolean }[]>([]);
  const [newTodo, setNewTodo] = useState('');

  const greetingOpacity = useRef(new Animated.Value(0)).current;
  const greetingTranslate = useRef(new Animated.Value(30)).current;
  const quoteOpacity = useRef(new Animated.Value(0)).current;
  const quoteTranslate = useRef(new Animated.Value(30)).current;
  const positionY = useRef(new Animated.Value(0)).current; // swipe
  const isAnimating = useRef(false);

  // Refs for gratitude inputs to handle focus management
  const gratitude2Ref = useRef<TextInput>(null);
  const gratitude3Ref = useRef<TextInput>(null);

  const addTodo = () => {
    if (newTodo.trim()) {
      const newTodoItem = {
        id: Date.now(),
        text: newTodo.trim(),
        completed: false
      };
      setTodos([...todos, newTodoItem]);
      setNewTodo('');
      Keyboard.dismiss();
    }
  };

  const toggleTodo = (id: number) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const handleNameSubmit = () => {
    if (!inputName.trim()) return;
    setUserName(inputName.trim());
    Keyboard.dismiss();
    setScreen('greeting');
    animateGreeting();
  };

  // Handle gratitude input submissions
  const handleGratitudeSubmit = (gratitudeNumber: number) => {
    switch (gratitudeNumber) {
      case 1:
        gratitude2Ref.current?.focus();
        break;
      case 2:
        gratitude3Ref.current?.focus();
        break;
      case 3:
        Keyboard.dismiss();
        break;
    }
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
        setTimeout(showQuoteScreen, 1000);
      }
    };
    type();
  };

  const showQuoteScreen = () => {
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
      <Text style={[styles.promptText, { fontSize: 50 }]}>
        Welcome, <Text style={{ color: '#CC8400' }}>Early Bird</Text>
      </Text>
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

  const JournalScreen = () => (
    <View style={styles.journalContainer}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => {
          setScreen('quote');
          animateQuote();
        }}
      >
        <Text style={styles.backButtonText}>← Back to Quote</Text>
      </TouchableOpacity>
      
      <Text style={styles.journalTitle}>Morning Gratitude</Text>
      <Text style={styles.journalSubtitle}>What are you grateful for today?</Text>
      
      <View style={styles.gratitudeSection}>
        <View style={styles.gratitudeItem}>
          <Text style={styles.gratitudeNumber}>1.</Text>
          <TextInput
            style={styles.gratitudeInput}
            placeholder="Something you're thankful for..."
            placeholderTextColor="#8D6E63"
            value={gratitude1}
            onChangeText={setGratitude1}
            multiline={false}
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => handleGratitudeSubmit(1)}
          />
        </View>

        <View style={styles.gratitudeItem}>
          <Text style={styles.gratitudeNumber}>2.</Text>
          <TextInput
            ref={gratitude2Ref}
            style={styles.gratitudeInput}
            placeholder="Another blessing in your life..."
            placeholderTextColor="#8D6E63"
            value={gratitude2}
            onChangeText={setGratitude2}
            multiline={false}
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => handleGratitudeSubmit(2)}
          />
        </View>

        <View style={styles.gratitudeItem}>
          <Text style={styles.gratitudeNumber}>3.</Text>
          <TextInput
            ref={gratitude3Ref}
            style={styles.gratitudeInput}
            placeholder="One more thing to appreciate..."
            placeholderTextColor="#8D6E63"
            value={gratitude3}
            onChangeText={setGratitude3}
            multiline={false}
            returnKeyType="done"
            blurOnSubmit={true}
            onSubmitEditing={() => handleGratitudeSubmit(3)}
          />
        </View>
      </View>

      <View style={styles.journalFooter}>
        <Text style={styles.footerText}>Starting your day with gratitude</Text>
        <Text style={styles.footerHint}>Press Enter to move to the next field</Text>
      </View>
    </View>
  );

  const ToDoScreen = () => (
    <View style={styles.todoContainer}>
      <TouchableOpacity 
        style={styles.backButtonTodo}
        onPress={() => {
          setScreen('quote');
          animateQuote();
        }}
      >
        <Text style={styles.backButtonTextTodo}>← Back to Quote</Text>
      </TouchableOpacity>
      
      <Text style={styles.todoTitle}>Your To-Do List</Text>
      
      <View style={styles.todoInputContainer}>
        <TextInput
          style={styles.todoInput}
          placeholder="Add a new task..."
          placeholderTextColor="#6B8F9C"
          value={newTodo}
          onChangeText={setNewTodo}
          onSubmitEditing={addTodo}
          returnKeyType="done"
          multiline={false}
          blurOnSubmit={false}
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={addTodo}
          disabled={!newTodo.trim()}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.todoHint}>Press Enter to add your task</Text>

      <View style={styles.todoList}>
        {todos.length === 0 ? (
          <Text style={styles.emptyState}>No tasks yet. Add one above!</Text>
        ) : (
          todos.map((todo) => (
            <View key={todo.id} style={styles.todoItem}>
              <TouchableOpacity
                style={[styles.checkbox, todo.completed && styles.checkboxCompleted]}
                onPress={() => toggleTodo(todo.id)}
              >
                <Text style={styles.checkmark}>{todo.completed ? '✓' : ''}</Text>
              </TouchableOpacity>
              
              <Text style={[
                styles.todoText,
                todo.completed && styles.todoTextCompleted
              ]}>
                {todo.text}
              </Text>
              
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteTodo(todo.id)}
              >
                <Text style={styles.deleteButtonText}>×</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
      
      {todos.length > 0 && (
        <View style={styles.todoStats}>
          <Text style={styles.statsText}>
            {todos.filter(t => t.completed).length} of {todos.length} completed
          </Text>
        </View>
      )}
    </View>
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
      
      <View style={styles.navigationButtons}>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => setScreen('journal')}
        >
          <Text style={styles.navButtonIcon}> 📓 </Text>
          <Text style={styles.navButtonText}>Journal</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => setScreen('todo')}
        >
          <Text style={styles.navButtonIcon}>✓</Text>
          <Text style={styles.navButtonText}>To-Do</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  return (
    <Animated.View
      style={[styles.container, { transform: [{ translateY: positionY }] }]}
     // {...panResponder.panHandlers}
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <LinearGradient
        colors={['#FFF8E1', '#FFE082', '#FFECB3', '#FFF8E1']}
        locations={[0, 0.3, 0.7, 1]}
        start={{ x: 0.5, y: 0.2 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.gradient}
      />

      {screen === 'input' && <InputScreen />}
      {screen === 'greeting' && <GreetingScreen />}
      {screen === 'quote' && <QuoteScreen />}
      {screen === 'journal' && <JournalScreen />}
      {screen === 'todo' && <ToDoScreen />}
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
    marginBottom: 60,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    maxWidth: 300,
  },
  navButton: {
    backgroundColor: 'rgba(204, 132, 0, 0.1)',
    borderRadius: 20,
    paddingVertical: 15,
    paddingHorizontal: 25,
    alignItems: 'center',
    minWidth: 100,
    borderWidth: 1,
    borderColor: 'rgba(204, 132, 0, 0.2)',
  },
  navButtonIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  navButtonText: {
    fontSize: 16,
    color: '#5D4037',
    fontWeight: '500',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: 'rgba(93, 64, 55, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    zIndex: 10,
  },
  backButtonText: {
    color: '#5D4037',
    fontSize: 16,
    fontWeight: '500',
  },
  backButtonTodo: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: 'rgba(46, 74, 98, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    zIndex: 10,
  },
  backButtonTextTodo: {
    color: '#2E4A62',
    fontSize: 16,
    fontWeight: '500',
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
  journalContainer: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 30,
    paddingBottom: 40,
    backgroundColor: '#FFF3CD',
  },
  journalTitle: {
    fontSize: 32,
    fontWeight: '600',
    color: '#5D4037',
    marginBottom: 8,
    textAlign: 'center',
  },
  journalSubtitle: {
    fontSize: 18,
    color: '#8D6E63',
    textAlign: 'center',
    marginBottom: 40,
    fontWeight: '300',
  },
  gratitudeSection: {
    flex: 1,
    justifyContent: 'space-around',
  },
  gratitudeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 30,
    backgroundColor: '#FFFBF0',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#D7CCC8',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  gratitudeNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#CC8400',
    marginRight: 15,
    marginTop: 5,
  },
  gratitudeInput: {
    flex: 1,
    fontSize: 18,
    color: '#4A2C20',
    lineHeight: 24,
    minHeight: 40,
    textAlignVertical: 'center',
  },
  journalFooter: {
    alignItems: 'center',
    paddingTop: 20,
  },
  footerText: {
    fontSize: 16,
    color: '#8D6E63',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  footerHint: {
    fontSize: 14,
    color: '#A1887F',
    textAlign: 'center',
    marginTop: 5,
    fontStyle: 'italic',
  },
  todoContainer: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 30,
    paddingBottom: 40,
    backgroundColor: '#D1E8E2',
  },
  todoTitle: {
    fontSize: 32,
    fontWeight: '600',
    color: '#2E4A62',
    marginBottom: 30,
    textAlign: 'center',
  },
  todoInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#E8F4F8',
    borderRadius: 15,
    padding: 5,
  },
  todoInput: {
    flex: 1,
    fontSize: 18,
    color: '#2E4A62',
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  todoHint: {
    fontSize: 14,
    color: '#6B8F9C',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  addButton: {
    backgroundColor: '#4A90A4',
    borderRadius: 25,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  todoList: {
    flex: 1,
  },
  emptyState: {
    fontSize: 18,
    color: '#6B8F9C',
    textAlign: 'center',
    marginTop: 40,
    fontStyle: 'italic',
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#B0BEC5',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4A90A4',
    marginRight: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCompleted: {
    backgroundColor: '#4A90A4',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  todoText: {
    flex: 1,
    fontSize: 18,
    color: '#2E4A62',
  },
  todoTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#6B8F9C',
  },
  deleteButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E8F4F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    fontSize: 20,
    color: '#6B8F9C',
    fontWeight: 'bold',
  },
  todoStats: {
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#B0BEC5',
    marginTop: 20,
  },
  statsText: {
    fontSize: 16,
    color: '#4A90A4',
    fontWeight: '500',
  },
});