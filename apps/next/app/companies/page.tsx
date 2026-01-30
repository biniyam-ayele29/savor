'use client'

import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput } from 'react-native';
import { useCompanies, useCreateCompany, Company } from '@my-app/api';
import { TextLink } from 'solito/link';

export default function CompaniesPage() {
    const { data: companies = [], isLoading } = useCompanies();
    const createCompany = useCreateCompany();

    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState('');
    const [floor, setFloor] = useState('');
    const [suite, setSuite] = useState('');
    const [email, setEmail] = useState('');

    const handleAddCompany = async () => {
        if (!name || !floor || !suite) {
            alert('Please fill in required fields');
            return;
        }

        try {
            await createCompany.mutateAsync({
                name,
                floorNumber: Number(floor),
                suiteNumber: suite,
                contactEmail: email,
                isActive: true
            });
            setShowForm(false);
            setName('');
            setFloor('');
            setSuite('');
            setEmail('');
        } catch (error) {
            console.error('Error adding company:', error);
            alert('Failed to add company');
        }
    };

    const groupedCompanies = companies.reduce((acc, company) => {
        const floorKey = `Floor ${company.floorNumber}`;
        if (!acc[floorKey]) acc[floorKey] = [];
        acc[floorKey].push(company);
        return acc;
    }, {} as Record<string, Company[]>);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 24, color: '#6b7280' }}>Loading companies...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
            <View style={{ maxWidth: 1280, marginHorizontal: 'auto', width: '100%', padding: 32 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                    <View>
                        <Text style={{ fontSize: 36, fontWeight: 'bold', color: '#1f2937' }}>Registered Companies 🏢</Text>
                        <Text style={{ color: '#6b7280', fontSize: 18 }}>Manage office residents and their locations</Text>
                    </View>
                    <Pressable
                        onPress={() => setShowForm(!showForm)}
                        style={{ backgroundColor: '#ea580c', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}
                    >
                        <Text style={{ color: 'white', fontWeight: 'bold' }}>{showForm ? 'Cancel' : '+ Add Company'}</Text>
                    </Pressable>
                </View>

                {showForm && (
                    <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 24, marginBottom: 32, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
                        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>New Company Details</Text>
                        <View style={{ flexDirection: 'row', gap: 16, flexWrap: 'wrap' }}>
                            <View style={{ flex: 1, minWidth: 250 }}>
                                <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 8 }}>Company Name *</Text>
                                <TextInput
                                    style={{ backgroundColor: '#f9fafb', padding: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                                    placeholder="e.g. Tech Innovators"
                                    value={name}
                                    onChangeText={setName}
                                />
                            </View>
                            <View style={{ width: 100 }}>
                                <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 8 }}>Floor *</Text>
                                <TextInput
                                    style={{ backgroundColor: '#f9fafb', padding: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                                    placeholder="1-10"
                                    value={floor}
                                    onChangeText={setFloor}
                                    keyboardType="numeric"
                                />
                            </View>
                            <View style={{ width: 150 }}>
                                <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 8 }}>Suite *</Text>
                                <TextInput
                                    style={{ backgroundColor: '#f9fafb', padding: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                                    placeholder="e.g. 101A"
                                    value={suite}
                                    onChangeText={setSuite}
                                />
                            </View>
                            <View style={{ flex: 1, minWidth: 250 }}>
                                <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 8 }}>Contact Email</Text>
                                <TextInput
                                    style={{ backgroundColor: '#f9fafb', padding: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                                    placeholder="email@company.com"
                                    value={email}
                                    onChangeText={setEmail}
                                />
                            </View>
                        </View>
                        <Pressable
                            onPress={handleAddCompany}
                            style={{ backgroundColor: '#10b981', padding: 16, borderRadius: 8, marginTop: 24, alignItems: 'center' }}
                        >
                            <Text style={{ color: 'white', fontWeight: 'bold' }}>Register Company</Text>
                        </Pressable>
                    </View>
                )}

                {Object.entries(groupedCompanies).sort().map(([floorLabel, floorCompanies]) => (
                    <View key={floorLabel} style={{ marginBottom: 40 }}>
                        <View style={{ backgroundColor: '#f3f4f6', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, marginBottom: 16 }}>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#4b5563' }}>{floorLabel}</Text>
                        </View>
                        <View style={{ backgroundColor: 'white', borderRadius: 16, overflow: 'hidden', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                            <View style={{ flexDirection: 'row', backgroundColor: '#f9fafb', padding: 16, borderBottom: '1px solid #e5e7eb' }}>
                                <Text style={{ flex: 2, fontWeight: 'bold', color: '#6b7280' }}>Company Name</Text>
                                <Text style={{ flex: 1, fontWeight: 'bold', color: '#6b7280' }}>Suite</Text>
                                <Text style={{ flex: 2, fontWeight: 'bold', color: '#6b7280' }}>Contact Email</Text>
                                <Text style={{ flex: 1, fontWeight: 'bold', color: '#6b7280' }}>Status</Text>
                                <Text style={{ width: 80, fontWeight: 'bold', color: '#6b7280' }}>Actions</Text>
                            </View>
                            {floorCompanies.map((company) => (
                                <View key={company.id} style={{ flexDirection: 'row', padding: 16, borderBottom: '1px solid #f3f4f6', alignItems: 'center' }}>
                                    <Text style={{ flex: 2, fontSize: 16, fontWeight: '500' }}>{company.name}</Text>
                                    <Text style={{ flex: 1, color: '#4b5563' }}>{company.suiteNumber}</Text>
                                    <Text style={{ flex: 2, color: '#4b5563' }}>{company.contactEmail || '-'}</Text>
                                    <View style={{ flex: 1 }}>
                                        <View style={{ backgroundColor: company.isActive ? '#dcfce7' : '#fee2e2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 9999, alignSelf: 'flex-start' }}>
                                            <Text style={{ color: company.isActive ? '#166534' : '#991b1b', fontSize: 12, fontWeight: 'bold' }}>
                                                {company.isActive ? 'Active' : 'Inactive'}
                                            </Text>
                                        </View>
                                    </View>
                                    <TextLink href={`/companies/${company.id}`}>
                                        <View style={{ backgroundColor: '#f3f4f6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 }}>
                                            <Text style={{ color: '#ea580c', fontSize: 13, fontWeight: '500' }}>Details</Text>
                                        </View>
                                    </TextLink>
                                </View>
                            ))}
                        </View>
                    </View>
                ))}

                {companies.length === 0 && !showForm && (
                    <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 64, alignItems: 'center', border: '1px dashed #d1d5db' }}>
                        <Text style={{ fontSize: 48, marginBottom: 16 }}>🏢</Text>
                        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#6b7280' }}>No companies registered yet</Text>
                        <Text style={{ color: '#9ca3af', marginBottom: 24 }}>Start by adding companies to manage orders by office.</Text>
                        <Pressable
                            onPress={() => setShowForm(true)}
                            style={{ backgroundColor: '#ea580c', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}
                        >
                            <Text style={{ color: 'white', fontWeight: 'bold' }}>Register Your First Company</Text>
                        </Pressable>
                    </View>
                )}
            </View>
        </ScrollView>
    );
}
