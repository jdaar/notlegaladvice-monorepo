import React from 'react';
import {
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Theme from './Theme';

const WrappedView = ({children}: {children: React.ReactNode}) => {
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView
        style={{
          flex: 1,
          height: '100%',
          backgroundColor: Theme.color.backgroundPrimary
        }}
      >
      {children}
      </SafeAreaView>
    </>
  );
};

export default WrappedView;
