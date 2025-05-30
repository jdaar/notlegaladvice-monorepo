import { StyleSheet, View, Text, FlatList, ScrollView } from "react-native";
import Theme from "../common/Theme";
import { useDocumentStore } from "../state/store";
import { Document } from "../state/store";
import Button from "../common/Button";

const DocumentDetailEmptyMessage = () => {
  return (
    <View style={styles.emptyDetailContainer}>
      <Text style={styles.emptyDetailTitle}>Nada que ver por aqui...</Text>
      <Text style={styles.emptyDetailSubtitle}>Selecciona un archivo para visualizar sus datos</Text>
    </View>
  )
}

const TextListElement = ({text}: {text: string}) => {
  return (
    <View style={styles.detailTextDecorationContainer}>
      <View style={styles.detailTextDecoration} />
      <Text style={styles.detailText}>{text}</Text>
    </View>
  )
}

const TextList = ({text}: {text: Array<string>}) => {
    return (
      <FlatList
          pagingEnabled={false}
          style={styles.detailListContainer}
          data={text.map(textItem => ({data: textItem, id: Math.random().toString()}))}
          numColumns={1}
          renderItem={item => <TextListElement text={item.item.data}/>}
          keyExtractor={item => item.data.concat(item.id)}
      />
    )
}

const DocumentDetailMessage = ({data}: {data: Document}) => {
  return (
    <View style={styles.nonEmptyDetailContainer}>
      <ScrollView style={{height: '100%', width: '100%'}} contentContainerStyle={styles.detailListScrollContainer}>
        <Text style={styles.detailTitle}>{data.title}</Text>
        <Text style={styles.detailSubtitle}>Obligaciones</Text>
        <TextList text={new Array(5).fill(null).map(_ => "prueba")}/>
        <Text style={styles.detailSubtitle}>Derechos</Text>
        <TextList text={new Array(5).fill(null).map(_ => "prueba")}/>
        <Text style={styles.detailSubtitle}>Partes involucradas</Text>
        <TextList text={new Array(5).fill(null).map(_ => "prueba")}/>
        <Text style={styles.detailSubtitle}>Condiciones economicas</Text>
        <TextList text={new Array(10).fill(null).map(_ => "prueba")}/>
        <View style={styles.buttonContainer}>
          <Button><Text style={styles.buttonText}>Descargar archivo</Text></Button>
          <Button><Text style={styles.buttonText}>Deshabilitar archivo</Text></Button>
          <Button><Text style={styles.buttonText}>Eliminar archivo</Text></Button>
        </View>
      </ScrollView>
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
        <DocumentDetailMessage data={actualDocument}/>
      }
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    width: '100%',
    gap: Theme.spacing.extrasmall,
    justifyContent: 'flex-end',
    paddingVertical: Theme.spacing.large
  },
  buttonText: {
    color: Theme.color.backgroundPrimary,
    fontFamily: Theme.font.normal,
    fontWeight: 'bold',
    alignSelf: 'center'
  },
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
  nonEmptyDetailContainer: {
    flex: 1,
    gap: Theme.spacing.extrasmall,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    height: '100%'
  },
  emptyDetailTitle: {
    fontFamily: Theme.font.normal,
    fontSize: Theme.fontSize.medium,
    fontWeight: '600'
  },
  emptyDetailSubtitle: {
    fontFamily: Theme.font.normal,
    fontSize: Theme.fontSize.small,
  },
  detailTitle: {
    fontFamily: Theme.font.normal,
    fontSize: Theme.fontSize.medium,
    fontWeight: '600'
  },
  detailSubtitle: {
    fontFamily: Theme.font.normal,
    fontSize: Theme.fontSize.small,
    padding: Theme.spacing.medium,
    fontWeight: '600'
  },
  detailText: {
    fontFamily: Theme.font.normal,
    fontSize: Theme.fontSize.small,
    fontWeight: 'normal'
  },
  detailListScrollContainer: {
    flex: 1,
    width: '100%',
  },
  detailTextDecorationContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: Theme.spacing.small,
    maxHeight: 20
  },
  detailTextDecoration: {
    width: 7,
    height: 7,
    borderRadius: '100%',
    backgroundColor: Theme.color.foregroundPrimary
  },
  detailListContainer: {
    height: '100%',
    minHeight: 100,
    paddingLeft: Theme.spacing.medium
  }
})

export default DocumentDetail;

