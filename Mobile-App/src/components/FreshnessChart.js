import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, ProgressBar, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const FreshnessChart = ({ goodCount, acceptableCount, notRecommendedCount }) => {
  const theme = useTheme();
  
  // Calculate total and percentages
  const total = goodCount + acceptableCount + notRecommendedCount;
  const goodPercent = total > 0 ? (goodCount / total) : 0;
  const acceptablePercent = total > 0 ? (acceptableCount / total) : 0;
  const notRecommendedPercent = total > 0 ? (notRecommendedCount / total) : 0;

  return (
    <View style={styles.container}>
      {/* Fresh (GOOD) */}
      <View style={styles.freshnessItem}>
        <View style={styles.labelContainer}>
          <MaterialCommunityIcons 
            name="leaf" 
            size={24} 
            color={theme.colors.success} 
          />
          <Text style={styles.label}>Fresh</Text>
          <Text style={[styles.count, { color: theme.colors.success }]}>
            {goodCount}
          </Text>
        </View>
        <ProgressBar 
          progress={goodPercent} 
          color={theme.colors.success} 
          style={styles.progressBar} 
        />
        <Text style={styles.percentage}>
          {Math.round(goodPercent * 100)}%
        </Text>
      </View>

      {/* Fair (ACCEPTABLE) */}
      <View style={styles.freshnessItem}>
        <View style={styles.labelContainer}>
          <MaterialCommunityIcons 
            name="alert" 
            size={24} 
            color={theme.colors.warning} 
          />
          <Text style={styles.label}>Fair</Text>
          <Text style={[styles.count, { color: theme.colors.warning }]}>
            {acceptableCount}
          </Text>
        </View>
        <ProgressBar 
          progress={acceptablePercent} 
          color={theme.colors.warning} 
          style={styles.progressBar} 
        />
        <Text style={styles.percentage}>
          {Math.round(acceptablePercent * 100)}%
        </Text>
      </View>

      {/* Poor (NOT_RECOMMENDED) */}
      <View style={styles.freshnessItem}>
        <View style={styles.labelContainer}>
          <MaterialCommunityIcons 
            name="alert-circle" 
            size={24} 
            color={theme.colors.error} 
          />
          <Text style={styles.label}>Poor</Text>
          <Text style={[styles.count, { color: theme.colors.error }]}>
            {notRecommendedCount}
          </Text>
        </View>
        <ProgressBar 
          progress={notRecommendedPercent} 
          color={theme.colors.error} 
          style={styles.progressBar} 
        />
        <Text style={styles.percentage}>
          {Math.round(notRecommendedPercent * 100)}%
        </Text>
      </View>

      <Text style={styles.totalText}>
        Total scans analyzed: {total}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
  freshnessItem: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    marginLeft: 8,
    fontSize: 16,
    flex: 1,
  },
  count: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  percentage: {
    alignSelf: 'flex-end',
    fontSize: 12,
    marginTop: 2,
    opacity: 0.7,
  },
  totalText: {
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.7,
  },
});

export default FreshnessChart;
