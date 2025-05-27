import React, { useEffect } from "react";
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from "expo-font";
import Theme from "../common/Theme";

SplashScreen.preventAutoHideAsync();

const FontProvider = ({children}: {children: React.ReactNode}) => {
  const [loaded, error] = useFonts({
    [Theme.font.normal]: require('../../assets/lora.ttf'),
    [Theme.font.italic]: require('../../assets/lora_italic.ttf')
  })

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync()
    }
  }, [loaded, error])

  return children;
};

export default FontProvider;
