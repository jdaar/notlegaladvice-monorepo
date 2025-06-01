import { StyleSheet, View, TouchableOpacity, TouchableOpacityProps } from "react-native";
import Theme from "./Theme";
import React from "react";

const Button = ({children, onPress}: {children: React.ReactNode} & TouchableOpacityProps) => {
  return (
    <TouchableOpacity onPress={onPress}>
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
