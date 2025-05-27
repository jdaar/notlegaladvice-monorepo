import { StyleSheet, Text, View } from 'react-native';
import Dashboard from '../views/Dashboard';
import ToastManager from 'toastify-react-native';
import Theme from '../common/Theme';

const toastConfig = {
  success: (props: { text1: string, text2: string }) => (
    <View style={toastStyle.toastContainer}>
      <Text style={toastStyle.toastText}>{props.text1}</Text>
    </View>
  ),
}

const toastStyle = StyleSheet.create({
  toastContainer: {
    padding: Theme.spacing.small,
    backgroundColor: Theme.color.foregroundSecondary,
    borderRadius: Theme.borderRadius,
    borderColor: Theme.color.foregroundPrimary,
    borderWidth: Theme.borderWidth.button,
  },
  toastText: {
    fontFamily: Theme.font.italic,
    color: Theme.color.backgroundPrimary,
    fontWeight: '600'
  }
})

const App = () => {
  return (
    <>
      <Dashboard/>
      <ToastManager config={toastConfig} position='bottom' />
    </>
  );
};

export default App;
