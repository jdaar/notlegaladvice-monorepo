import { StyleSheet, View, Text } from "react-native";
import Theme from "../common/Theme";
import { useDocumentStore } from "../state/store";

type Document = {}

const DocumentDetailEmptyMessage = () => {
  return (
    <View style={styles.emptyDetailContainer}>
      <Text style={styles.emptyDetailTitle}>Nada que ver por aqui...</Text>
      <Text style={styles.emptyDetailSubtitle}>Selecciona un archivo para visualizar sus datos</Text>
    </View>
  )
}

const DocumentDetail = () => {
  const actualDocument = useDocumentStore(store => store.selectedDocument);

  return (
    <View style={styles.detailContainer}>
      {actualDocument == null &&
        <DocumentDetailEmptyMessage />
      }
      {actualDocument != null &&
        <Text style={styles.emptyDetailTitle}>{actualDocument.title}</Text>
      }
    </View>
  );
};

const styles = StyleSheet.create({
  detailContainer: {
    padding: Theme.spacing.small,
    color: Theme.color.foregroundPrimary,
    backgroundColor: Theme.color.backgroundSecondary,
    borderRadius: Theme.borderRadius,
    borderColor: Theme.color.foregroundPrimary,
    borderWidth: Theme.borderWidth.button,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '100%'
  },
  emptyDetailContainer: {
    flex: 1,
    gap: Theme.spacing.extrasmall,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column'
  },
  emptyDetailTitle: {
    fontFamily: Theme.font.normal,
    fontSize: Theme.fontSize.medium,
    fontWeight: '600'
  },
  emptyDetailSubtitle: {
    fontFamily: Theme.font.normal,
    fontSize: Theme.fontSize.small,
  }
})

export default DocumentDetail;
