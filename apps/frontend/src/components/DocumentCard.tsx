import { StyleSheet, View, Text, TouchableOpacity, ViewStyle, Image, GestureResponderEvent } from "react-native";
import Theme from "../common/Theme";
import { useDocumentStore } from "../state/store";
import { useCallback } from "react";

type DocumentCardDataProp = {
  documentTitle: string;
  involvedPartsCount: number;
  obligationsCount: number;
  rightsCount: number;
  economicConditionsSum: number;
}

const DocumentCard = ({style, data}: {style?: ViewStyle, data: DocumentCardDataProp}) => {
  const setSelectedDocument = useDocumentStore(store => store.setSelectedDocument);
  const handleCardOnPress = useCallback((_: GestureResponderEvent) => {
    setSelectedDocument({title: data.documentTitle})
  }, []);

  /*
        */
  return (
    <TouchableOpacity onPress={handleCardOnPress}>
      <View style={{...styles.cardContainer, ...style}}>
        <View style={styles.cardImageContainer}>
          <Image style={{ width: '100%', height: '100%', borderTopLeftRadius: Theme.borderRadius, borderTopRightRadius: Theme.borderRadius }} source={{
            uri: 'https://www.w3schools.com/howto/img_avatar.png'
          }}/>
        </View>
        <View style={styles.cardDetailContainer}>
          <Text style={styles.cardDetailTitle}>{data.documentTitle}</Text>
          <View style={{ gap: Theme.spacing.extrasmall }}>
            <Text style={styles.cardDetailSubtitle}>{data.involvedPartsCount} partes involucradas</Text>
            <Text style={styles.cardDetailSubtitle}>{data.obligationsCount} obligaciones</Text>
            <Text style={styles.cardDetailSubtitle}>{data.rightsCount} derecho</Text>
            <Text style={styles.cardDetailSubtitle}>${data.economicConditionsSum} en condiciones economicas</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: Theme.color.foregroundSecondary,
    borderRadius: Theme.borderRadius,
    borderColor: Theme.color.foregroundPrimary,
    borderWidth: Theme.borderWidth.card,
    flex: 1,
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    minHeight: 350
  },
  cardImageContainer: {
    height: '50%',
    width: '100%'
  },
  cardDetailContainer: {
    padding: Theme.spacing.small,
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  cardDetailTitle: {
    fontFamily: Theme.font.normal,
    fontSize: Theme.fontSize.small,
    color: Theme.color.backgroundSecondary,
    fontWeight: '600',
    paddingBottom: Theme.spacing.extrasmall
  },
  cardDetailSubtitle: {
    fontFamily: Theme.font.normal,
    fontSize: Theme.fontSize.small,
    color: Theme.color.backgroundPrimary
  }
})

export default DocumentCard;
