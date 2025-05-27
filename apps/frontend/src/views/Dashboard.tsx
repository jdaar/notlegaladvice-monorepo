import React from 'react';
import WrappedView from '../common/WrappedView';
import { ScrollView, StyleSheet, View } from 'react-native';
import Header from '../components/Header';
import DocumentList from '../components/DocumentList';
import FontProvider from '../providers/FontProvider';
import DocumentSummary from '../components/DocumentSummary';
import DocumentDetail from '../components/DocumentDetail';
import Theme from '../common/Theme';

const Dashboard = () => {
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
          <View style={styles.documentDataContainer}>
            <DocumentList/>
            <View style={styles.documentDetailContainer}>
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
  }
})

export default Dashboard;
