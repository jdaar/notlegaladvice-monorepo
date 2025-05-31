import { Dimensions, FlatList, LayoutChangeEvent, ScrollView, StyleSheet, View } from "react-native";
import Theme from "../common/Theme";
import DocumentCard from "./DocumentCard";
import { useEffect, useMemo, useState } from "react";

const mockData = {
  documentTitle: "Terminos y condiciones de servicio de salud EMIaaaaaaa aaaaaaaaaaa aaaaaaaaaaa a aaaaaaaaaaaa a aaa aaaaaaaaaaa",
  involvedPartsCount: 2,
  obligationsCount: 2,
  rightsCount: 1,
  economicConditionsSum: 100_000
}

const calculateColumnNumber = (windowWidth: number) => {
  const isOneColumn = windowWidth > 0 && windowWidth < Theme.mediaQueries.table.twoColumn;
  const isTwoColumn = windowWidth > Theme.mediaQueries.table.twoColumn && windowWidth < Theme.mediaQueries.table.threeColumn;
  return isOneColumn ? 1 : (isTwoColumn ? 2 : 3);
}

const DocumentList = () => {
  const [dimensions, setDimensions] = useState<{
    width: number
  }>({
    width: Dimensions.get("window").width
  });

  useEffect(() => {
    Dimensions.addEventListener(
      "change",
      ({window}) => {
        setDimensions({
          width: window.width
        })
      }
    )
  }, [])

  const [documentListWidth, setDocumentListWidth] = useState(-1);

  const handleDocumentListContainerOnLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    if (documentListWidth == -1 || documentListWidth != width)
      setDocumentListWidth(width);
  }

  const data = useMemo(() => new Array(100).fill(0).map(_ => ({data: {...mockData, id: Math.random().toString()}})), [])

  return (
      <ScrollView contentContainerStyle={styles.documentsContainer}>
        <FlatList
          style={styles.documentsListContainer}
          contentContainerStyle={styles.documentsListItemContainer}
          data={data}
          onLayout={handleDocumentListContainerOnLayout}
          numColumns={calculateColumnNumber(dimensions.width)}
          renderItem={item => <DocumentCard data={item.item.data} style={{maxWidth: documentListWidth / calculateColumnNumber(dimensions.width), minHeight: 375}}/>}
          keyExtractor={item => item.data.documentTitle.concat(item.data.id)}
          key={calculateColumnNumber(dimensions.width)}
        />
      </ScrollView>
  );
};

const styles = StyleSheet.create({
  documentsContainer: {
    padding: Theme.spacing.small,
    gap: Theme.spacing.small,
    color: Theme.color.foregroundPrimary,
    backgroundColor: Theme.color.foregroundPrimary,
    borderRadius: Theme.borderRadius,
    borderColor: Theme.color.foregroundPrimary,
    borderWidth: Theme.borderWidth.button,
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    height: '100%'
  },
  documentsListContainer: {
    flex: 1,
    height: '100%',
    gap: Theme.spacing.small,
    width: '100%'
  },
  documentsListItemContainer: {
    flex: 1,
    alignItems: 'stretch',
    height: '100%',
    gap: Theme.spacing.small,
    width: '100%'
  }
})

export default DocumentList;
