import { StyleSheet, View, TouchableOpacity } from "react-native";
import Theme from "./Theme";
import React from "react";

const Button = ({children}: {children: React.ReactNode}) => {
  return (
    <TouchableOpacity>
      <View style={styles.buttonContainer}>
        {children}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    padding: Theme.spacing.small,
    color: Theme.color.foregroundPrimary,
    backgroundColor: Theme.color.foregroundSecondary,
    borderRadius: Theme.borderRadius,
    borderColor: Theme.color.foregroundPrimary,
    borderWidth: Theme.borderWidth.button
  }
})

export default Button;
