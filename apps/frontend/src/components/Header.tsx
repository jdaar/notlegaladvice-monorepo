import { Text, StyleSheet, View, LayoutChangeEvent, Image, Dimensions } from "react-native";
import Theme from "../common/Theme";
import Button from "../common/Button";
import { useEffect, useState } from "react";

const Header = () => {
  const [headerHeight, setHeaderHeight] = useState(-1);

  const handleHeaderContainerOnLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    if (headerHeight == -1 || headerHeight != height)
      setHeaderHeight(height);
  }

  return (
    <View style={styles.headerContainer} onLayout={handleHeaderContainerOnLayout}>
      <Text style={styles.headerTitle}>NotLegalAdvice</Text>
      <View style={styles.headerRightSideContainer}>
        <Button>
          <Text style={styles.buttonText}>Abrir chat</Text>
        </Button>
        <View style={{...styles.avatarContainer, height: headerHeight/2 }}>
          <Image style={{width: '100%', height: '100%', borderRadius: '100%'}} source={{
            uri: 'https://www.w3schools.com/howto/img_avatar.png'
          }}></Image>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Theme.spacing.large,
  },
  headerRightSideContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: Theme.spacing.small
  },
  headerTitle: {
    fontWeight: 'bold',
    fontFamily: Theme.font.italic,
    fontSize: Theme.fontSize.large
  },
  buttonText: {
    fontFamily: Theme.font.normal,
    fontSize: Theme.fontSize.small,
    fontWeight: 'bold',
    color: Theme.color.backgroundSecondary
  },
  avatarContainer: {
    backgroundColor: Theme.color.foregroundPrimary,
    aspectRatio: 1,
    borderRadius: '100%',
    borderColor: Theme.color.foregroundPrimary,
    borderWidth: Theme.borderWidth.button
  }
})

export default Header;
