import { FlatList, LayoutChangeEvent, ScrollView, StyleSheet, View } from "react-native";
import Theme from "../common/Theme";
import DocumentCard from "./DocumentCard";
import { useState } from "react";

const mockData = {
  documentTitle: "Terminos y condiciones de servicio de salud EMI",
  involvedPartsCount: 2,
  obligationsCount: 2,
  rightsCount: 1,
  economicConditionsSum: 100_000
}

const DocumentList = () => {
  return (
      <ScrollView contentContainerStyle={styles.documentsContainer}>
        <FlatList
          style={styles.documentsListContainer}
          data={new Array(100).fill(0).map(_ => ({data: mockData}))}
          numColumns={3}
          renderItem={item => <DocumentCard data={item.item.data}/>}
          keyExtractor={item => item.data.documentTitle}
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
  }
})

export default DocumentList;
