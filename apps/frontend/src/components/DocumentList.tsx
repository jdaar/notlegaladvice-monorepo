import { Dimensions, FlatList, LayoutChangeEvent, ScrollView, StyleSheet } from "react-native";
import Theme from "../common/Theme";
import DocumentCard from "./DocumentCard";
import { useEffect, useState } from "react";
import { useDocumentStore } from "../state/store";

const calculateColumnNumber = (windowWidth: number) => {
  const isOneColumn = windowWidth > 0 && windowWidth < Theme.mediaQueries.table.twoColumn;
  const isTwoColumn = windowWidth > Theme.mediaQueries.table.twoColumn && windowWidth < Theme.mediaQueries.table.threeColumn;
  return isOneColumn ? 1 : (isTwoColumn ? 2 : 3);
}

const DocumentList = () => {
  const documents = useDocumentStore((state) => state.documents);

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

  return (
      <ScrollView contentContainerStyle={styles.documentsContainer}>
        <FlatList
          style={styles.documentsListContainer}
          contentContainerStyle={styles.documentsListItemContainer}
          data={documents?.map(v => ({data: v}))}
          onLayout={handleDocumentListContainerOnLayout}
          numColumns={calculateColumnNumber(dimensions.width)}
          renderItem={item => <DocumentCard data={item.item.data} style={{width: documentListWidth / calculateColumnNumber(dimensions.width), minHeight: 375}}/>}
          keyExtractor={item => item.data.id!}
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
