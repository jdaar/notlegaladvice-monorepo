import { getDocumentAsync } from 'expo-document-picker';
import { Dimensions, GestureResponderEvent, Platform, StyleSheet, Text, View } from "react-native";
import Theme from "../common/Theme";
import { useCallback, useEffect, useMemo, useState } from "react";
import Button from "../common/Button";
import { Toast } from 'toastify-react-native';
import { useDocumentStore } from '../state/store';
import { Record } from 'effect';
import { DomainEntities } from "@notlegaladvice/domain";

const DocumentSummary = () => {
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

  const [isUploading, setIsUploading] = useState(false);

  const setDocuments = useDocumentStore(state => state.setDocuments)

  const handleUploadFileOnPress = useCallback(async (_: GestureResponderEvent) => {
    if (!isUploading) {
      setIsUploading(true);

      Toast.success("Obteniendo el documento...");
      const documentToUpload = await getDocumentAsync({
        type: 'application/pdf'
      })

      if (!documentToUpload.canceled && documentToUpload.assets && documentToUpload.assets.length > 0) {
        if (Platform.OS == 'web') {
          try {
            Toast.success("Subiendo el documento, este proceso puede tomar un momento...");
            const response = await fetch("http://localhost:3000/api/v1/legal-document", {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
              },
              body: JSON.stringify({
                file: documentToUpload.assets[0].uri.split(',')[1]
              }),
            });
            if (response.ok) {
              const responseData = await response.json();
              Toast.success("Se creo el documento correctamente");
              fetch('http://localhost:3000/api/v1/legal-document')
                .then(response => response.json().then(
                  jsonResponse => {
                    setDocuments(
                      (jsonResponse as {
                        isError: boolean,
                        data: Array<Exclude<DomainEntities.LegalDocument, 'id'> & {_id: string}>
                      }).data.map(v => ({...v, id: v._id}))
                    )
                  }
                ))
              console.log(responseData)
            } else {
              const errorText = await response.text(); // Get error message from response body
              Toast.success("No se creo el documento debido a un error");
              console.error('Network or upload error:', errorText);
            }
          } catch (error) {
            console.error('Network or upload error:', error);
          }
        }
      }
        /*
        const formData = new FormData();

        formData.append('file', {
          uri: Platform.OS === 'ios' ? documentToUpload.assets[0].uri.replace('file://', '') : documentToUpload.assets[0].uri,
          name: documentToUpload.assets[0].name,
          type: 'application/pdf',
        });
        */

    }
  }, [])

  const isMobileLayout = dimensions.width < 715

  const documents = useDocumentStore(state => state.documents)

  const documentCount = useMemo(() => documents?.length, [documents]);

  const documentObligations = useMemo(() => documents?.map(v =>
    v.obligations.reduce((acc, item) => {
      const part = item.involvedPart;
      if (!acc[part]) {
        acc[part] = [];
      }
      acc[part].push(item);
      return acc;
    }, {} as Record<string, Array<DomainEntities.ObligationItem>>))
    .reduce((acc, currentGroup) => {
      for (const part of Object.keys(currentGroup)) {
        if (!acc[part]) {
          acc[part] = [];
        }
        acc[part].push(...currentGroup[part]);
      }
      return acc;
    }, {} as Record<string, Array<DomainEntities.ObligationItem>>),
    [documents]
  );

  const documentRights = useMemo(() => documents?.map(v =>
    v.rights.reduce((acc, item) => {
      const part = item.involvedPart;
      if (!acc[part]) {
        acc[part] = [];
      }
      acc[part].push(item);
      return acc;
    }, {} as Record<string, Array<DomainEntities.ObligationItem>>))
    .reduce((acc, currentGroup) => {
      for (const part of Object.keys(currentGroup)) {
        if (!acc[part]) {
          acc[part] = [];
        }
        acc[part].push(...currentGroup[part]);
      }
      return acc;
    }, {} as Record<string, Array<DomainEntities.ObligationItem>>),
    [documents]
  );

  const documentEconomicConditions = useMemo(() =>
    documents?.flatMap(v => v.economicConditions.map(vv => vv.amount))
      .reduce((acc, cur) => acc + cur, 0),
    [documents]
  )

  useEffect(() => console.log(
  ), [documentObligations])

  return (
    <View style={{...styles.summaryContainer, flexDirection: !isMobileLayout ? 'row' : 'column'}}>
      <View style={styles.summaryLeftSideContainer}>
        <Text style={styles.summaryTitle}>Ahora mismo cuentas con</Text>
        {
           !isMobileLayout ?
            (
            <View style={styles.metricContainer}>
              <Text style={{...styles.metricContent, paddingLeft: 0}}>{documentCount} archivos</Text>
              <View style={{...styles.metricSeparator, height: 30}}/>
              <Text style={styles.metricContent}>
              {Object.values(documentObligations as object).reduce((acc, cur) => acc + cur.length, 0)} obligaciones con un total de {Object.keys(documentObligations as object).length} partes involucradas</Text>
              <View style={{...styles.metricSeparator, height: 30}}/>
              <Text style={styles.metricContent}>{Object.values(documentRights as object).reduce((acc, cur) => acc + cur.length, 0)} derechos con un total de {Object.keys(documentRights as object).length} partes involucradas</Text>
              <View style={{...styles.metricSeparator, height: 30}}/>
              <Text style={{...styles.metricContent, paddingRight: 0}}>Un total de ${documentEconomicConditions} en condiciones economicas</Text>
            </View>
            ) : (
            <View style={styles.metricContainerVertical}>
              <Text style={{...styles.metricContent}}>• {documentCount} archivos</Text>
              <Text style={styles.metricContent}>• {Object.values(documentObligations as object).reduce((acc, cur) => acc + cur.length, 0)} obligaciones con un total de {Object.keys(documentObligations as object).length} partes involucradas</Text>
              <Text style={styles.metricContent}>• {Object.values(documentRights as object).reduce((acc, cur) => acc + cur.length, 0)} derechos con un total de {Object.keys(documentRights as object).length} partes involucradas</Text>
              <Text style={{...styles.metricContent, paddingRight: 0}}>• Un total de ${documentEconomicConditions} en condiciones economicas</Text>
            </View>
            )
        }
      </View>
      <Button>
        <Text style={styles.buttonText} onPress={handleUploadFileOnPress}>Subir archivo</Text>
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  summaryContainer: {
    padding: Theme.spacing.small,
    color: Theme.color.foregroundPrimary,
    backgroundColor: Theme.color.backgroundSecondary,
    borderRadius: Theme.borderRadius,
    borderColor: Theme.color.foregroundPrimary,
    borderWidth: Theme.borderWidth.button,
    marginLeft: Theme.spacing.large,
    marginRight: Theme.spacing.large,
    flex: 1,
    gap: Theme.spacing.medium,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryTitle: {
    fontFamily: Theme.font.normal,
    fontSize: Theme.fontSize.medium,
    fontWeight: '600',
  },
  metricContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  metricContainerVertical: {
    flex: 1,
    alignItems: 'flex-start'
  },
  summaryLeftSideContainer: {
    flex: 1,
    gap: Theme.spacing.extrasmall,
    width: '100%',
    flexDirection: 'column'
  },
  metricContent: {
    fontFamily: Theme.font.normal,
    fontSize: Theme.fontSize.small,
    fontWeight: '600',
    paddingRight: Theme.spacing.small,
    paddingLeft: Theme.spacing.small
  },
  metricSeparator: {
    width: Theme.borderWidth.separator,
    backgroundColor: Theme.color.foregroundPrimary
  },
  buttonText: {
    fontFamily: Theme.font.normal,
    fontSize: Theme.fontSize.small,
    fontWeight: 'bold',
    color: Theme.color.backgroundSecondary
  },
})

export default DocumentSummary;
