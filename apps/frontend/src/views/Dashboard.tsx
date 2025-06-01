import React, { useEffect, useState } from 'react';
import WrappedView from '../common/WrappedView';
import { Dimensions, StyleSheet, View } from 'react-native';
import Header from '../components/Header';
import DocumentList from '../components/DocumentList';
import FontProvider from '../providers/FontProvider';
import DocumentSummary from '../components/DocumentSummary';
import DocumentDetail from '../components/DocumentDetail';
import Theme from '../common/Theme';
import { useDocumentStore } from '../state/store';
import { DomainEntities } from '../../../../packages/domain/src/lib/entity';

const Dashboard = () => {
  const [dimensions, setDimensions] = useState<{
    width: number
  }>({
    width: Dimensions.get("window").width
  });
  const setDocuments = useDocumentStore(state => state.setDocuments)

  useEffect(() => {
    Dimensions.addEventListener(
      "change",
      ({window}) => {
        setDimensions({
          width: window.width
        })
      }
    );

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
  }, [])

  const isMobileLayout = dimensions.width > 800

  return (
    <FontProvider>
      <WrappedView>
        <View>
          <Header/>
        </View>
        <View style={{height: '85%'}}>
          <View>
            <DocumentSummary/>
          </View>
          <View style={{...styles.documentDataContainer, flexDirection: isMobileLayout ? 'row' : 'column'}}>
            <DocumentList/>
            <View style={isMobileLayout ? styles.documentDetailContainer : styles.documentDetailContainerVertical}>
            <DocumentDetail/>
            </View>
          </View>
        </View>
      </WrappedView>
    </FontProvider>
  );
};

const styles = StyleSheet.create({
  documentDataContainer: {
    flex: 1,
    flexDirection: 'row',
    marginLeft: Theme.spacing.large,
    marginRight: Theme.spacing.large,
    justifyContent: 'space-between',
    gap: Theme.spacing.medium,
    marginTop: Theme.spacing.medium,
    height: '100%',
  },
  documentDetailContainer: {
    width: '30%'
  },
  documentDetailContainerVertical: {
    width: '100%',
    maxHeight: 300
  }
})

export default Dashboard;
