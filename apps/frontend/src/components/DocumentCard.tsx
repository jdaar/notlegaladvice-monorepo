import { StyleSheet, View, Text, TouchableOpacity, ViewStyle, Image, GestureResponderEvent } from "react-native";
import Theme from "../common/Theme";
import { useDocumentStore } from "../state/store";
import { useCallback, useMemo } from "react";

type DocumentCardDataProp = {
  id: string;
  documentTitle: string;
  involvedPartsCount: number;
  obligationsCount: number;
  rightsCount: number;
  economicConditionsSum: number;
}

const SelectableSubtitle = ({isSelectedCard, text}: {isSelectedCard: boolean, text: string}) => <Text style={{...styles.cardDetailSubtitle, color: isSelectedCard ? Theme.color.foregroundPrimary : styles.cardDetailSubtitle.color}}>{text}</Text>

const DocumentCard = ({style, data}: {style?: ViewStyle, data: DocumentCardDataProp}) => {
  const selectedDocument = useDocumentStore(store => store.selectedDocument);
  const setSelectedDocument = useDocumentStore(store => store.setSelectedDocument);
  const handleCardOnPress = useCallback((_: GestureResponderEvent) => {
    setSelectedDocument({title: data.documentTitle, id: data.id})
  }, []);

  const isSelectedCard = useMemo(() => selectedDocument?.id == data.id, [selectedDocument])

  return (
    <TouchableOpacity onPress={handleCardOnPress}>
      <View style={{...(isSelectedCard ? styles.selectedCardContainer : styles.cardContainer), ...style}} key={data.id}>
        <View style={styles.cardImageContainer}>
          <Image style={{ width: '100%', height: '100%', borderTopLeftRadius: Theme.borderRadius, borderTopRightRadius: Theme.borderRadius }} source={{
            uri: 'https://www.w3schools.com/howto/img_avatar.png'
          }}/>
        </View>
        <View style={styles.cardDetailContainer}>
          <Text style={{...styles.cardDetailTitle, color: isSelectedCard ? Theme.color.foregroundPrimary : styles.cardDetailTitle.color }}>{data.documentTitle}</Text>
          <View style={{ gap: Theme.spacing.extrasmall }}>
            <SelectableSubtitle isSelectedCard={isSelectedCard} text={`${data.involvedPartsCount} partes involucradas`}/>
            <SelectableSubtitle isSelectedCard={isSelectedCard} text={`${data.obligationsCount} obligaciones`}/>
            <SelectableSubtitle isSelectedCard={isSelectedCard} text={`${data.rightsCount} derechos`}/>
            <SelectableSubtitle isSelectedCard={isSelectedCard} text={`$${data.economicConditionsSum} en condiciones economicas`}/>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  selectedCardContainer: {
    backgroundColor: Theme.color.backgroundSecondary,
    borderRadius: Theme.borderRadius,
    borderColor: Theme.color.backgroundPrimary,
    borderWidth: Theme.borderWidth.card,
    flex: 1,
    flexDirection: 'column',
    height: '100%',
    width: '100%',
  },
  cardContainer: {
    backgroundColor: Theme.color.foregroundSecondary,
    borderRadius: Theme.borderRadius,
    borderColor: Theme.color.foregroundPrimary,
    borderWidth: Theme.borderWidth.card,
    flex: 1,
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    minHeight: 35
  },
  cardImageContainer: {
    height: '50%',
    width: '100%'
  },
  cardDetailContainer: {
    padding: Theme.spacing.small,
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    width: '100%'
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
