import { getDocumentAsync } from 'expo-document-picker';
import { Dimensions, GestureResponderEvent, LayoutChangeEvent, StyleSheet, Text, View } from "react-native";
import Theme from "../common/Theme";
import { useEffect, useState } from "react";
import Button from "../common/Button";
import { Toast } from 'toastify-react-native';

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

  const handleUploadFileOnPress = async (_: GestureResponderEvent) => {
    if (!isUploading) {
      setIsUploading(true);

      const documentToUpload = await getDocumentAsync({
        type: 'application/pdf'
      })

      if (!documentToUpload.canceled && documentToUpload.assets && documentToUpload.assets.length > 0) {
        Toast.success("Se obtuvo el documento correctamente");
      }

      setIsUploading(false);
    }
  }

  return (
    <View style={styles.summaryContainer}>
      <View style={styles.summaryLeftSideContainer}>
        <Text style={styles.summaryTitle}>Ahora mismo cuentas con</Text>
        {
          dimensions.width > 715 ?
            (
            <View style={styles.metricContainer}>
              <Text style={{...styles.metricContent, paddingLeft: 0}}>7 archivos</Text>
              <View style={{...styles.metricSeparator, height: 30}}/>
              <Text style={styles.metricContent}>32 obligaciones con un total de 12 partes involucradas</Text>
              <View style={{...styles.metricSeparator, height: 30}}/>
              <Text style={styles.metricContent}>15 derechos con un total de 13 partes involucradas</Text>
              <View style={{...styles.metricSeparator, height: 30}}/>
              <Text style={{...styles.metricContent, paddingRight: 0}}>Un total de -$1.000.000 en condiciones economicas</Text>
            </View>
            ) : (
            <View style={styles.metricContainerVertical}>
              <Text style={{...styles.metricContent}}>• 7 archivos</Text>
              <Text style={styles.metricContent}>• 32 obligaciones con un total de 12 partes involucradas</Text>
              <Text style={styles.metricContent}>• 15 derechos con un total de 13 partes involucradas</Text>
              <Text style={{...styles.metricContent}}>• Un total de -$1.000.000 en condiciones economicas</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
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
