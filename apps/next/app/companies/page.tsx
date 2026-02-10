'use client'

import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { useCompanies, useCreateCompany, Company } from '@my-app/api';
import { TextLink } from 'solito/link';

export default function CompaniesPage() {
    const { data: companies = [], isLoading } = useCompanies();
    const createCompany = useCreateCompany();

    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState('');
    const [floor, setFloor] = useState('');
    const [email, setEmail] = useState('');

    const handleAddCompany = async () => {
        if (!name || !floor) {
            alert('Please fill in required fields');
            return;
        }

        try {
            await createCompany.mutateAsync({
                name,
                floorNumber: Number(floor),
                contactEmail: email,
                isActive: true
            });
            setShowForm(false);
            setName('');
            setFloor('');
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
            <View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundImage: 'linear-gradient(180deg, #fafaf9 0%, #f5f5f4 100%)',
            }}>
                <View style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundImage: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 20,
                }}>
                    <ActivityIndicator size="large" color="#E68B2C" />
                </View>
                <Text style={{ fontSize: 15, color: '#78716c', fontWeight: '600' }}>Loading companies...</Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={{ flex: 1, backgroundImage: 'linear-gradient(180deg, #fafaf9 0%, #f5f5f4 50%, #e7e5e4 100%)' }}
            contentContainerStyle={{ paddingVertical: 40 }}
        >
            <View style={{ maxWidth: 1280, marginHorizontal: 'auto', width: '100%', padding: 40 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40, flexWrap: 'wrap', gap: 24 }}>
                    <View>
                        <Text style={{ fontSize: 36, fontWeight: '900', color: '#1c1917', letterSpacing: -0.5 }}>Registered Companies</Text>
                        <Text style={{ color: '#78716c', fontSize: 16, marginTop: 6 }}>Manage office residents and their locations</Text>
                    </View>
                    <Pressable
                        onPress={() => setShowForm(!showForm)}
                        style={({ pressed }) => ({
                            backgroundImage: showForm ? 'linear-gradient(135deg, #f5f5f4 0%, #e7e5e4 100%)' : 'linear-gradient(135deg, #E68B2C 0%, #D97706 100%)',
                            paddingHorizontal: 28,
                            paddingVertical: 14,
                            borderRadius: 14,
                            shadowColor: showForm ? 'transparent' : '#E68B2C',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: showForm ? 0 : 0.3,
                            shadowRadius: 12,
                            opacity: pressed ? 0.95 : 1,
                        })}
                    >
                        <Text style={{ color: showForm ? '#78716c' : 'white', fontWeight: '700', fontSize: 15 }}>{showForm ? 'Cancel' : '+ Add Company'}</Text>
                    </Pressable>
                </View>

                {showForm && (
                    <View style={{
                        backgroundImage: 'linear-gradient(135deg, #ffffff 0%, #fafaf9 100%)',
                        borderRadius: 20,
                        padding: 28,
                        marginBottom: 40,
                        borderWidth: 1,
                        borderColor: '#e7e5e4',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.05,
                        shadowRadius: 16,
                    }}>
                        <Text style={{ fontSize: 20, fontWeight: '800', marginBottom: 24, color: '#1c1917' }}>New Company Details</Text>
                        <View style={{ flexDirection: 'row', gap: 20, flexWrap: 'wrap' }}>
                            {[
                                { label: 'Company Name *', value: name, set: setName, placeholder: 'e.g. Tech Innovators', flex: 1, minWidth: 250 },
                                { label: 'Floor *', value: floor, set: setFloor, placeholder: '1-10', width: 100, keyboardType: 'numeric' as const },
                                { label: 'Contact Email', value: email, set: setEmail, placeholder: 'email@company.com', flex: 1, minWidth: 250 },
                            ].map(({ label, value, set, placeholder, flex, minWidth, width, keyboardType }) => (
                                <View key={label} style={{ flex: flex ?? 0, minWidth, width }}>
                                    <Text style={{ fontSize: 13, fontWeight: '600', marginBottom: 8, color: '#44403c' }}>{label}</Text>
                                    <TextInput
                                        style={{
                                            backgroundColor: '#fafaf9',
                                            padding: 14,
                                            borderRadius: 12,
                                            borderWidth: 1,
                                            borderColor: '#e7e5e4',
                                            fontSize: 15,
                                            color: '#1c1917',
                                            width: width ?? undefined,
                                        }}
                                        placeholder={placeholder}
                                        placeholderTextColor="#a8a29e"
                                        value={value}
                                        onChangeText={set}
                                        keyboardType={keyboardType}
                                    />
                                </View>
                            ))}
                        </View>
                        <Pressable
                            onPress={handleAddCompany}
                            style={({ pressed }) => ({
                                backgroundImage: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                                padding: 16,
                                borderRadius: 12,
                                marginTop: 28,
                                alignItems: 'center',
                                shadowColor: '#059669',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.25,
                                shadowRadius: 12,
                                opacity: pressed ? 0.95 : 1,
                            })}
                        >
                            <Text style={{ color: 'white', fontWeight: '700', fontSize: 15 }}>Register Company</Text>
                        </Pressable>
                    </View>
                )}

                {Object.entries(groupedCompanies).sort().map(([floorLabel, floorCompanies]) => (
                    <View key={floorLabel} style={{ marginBottom: 40 }}>
                        <View style={{
                            backgroundImage: 'linear-gradient(135deg, #f5f5f4 0%, #e7e5e4 100%)',
                            paddingHorizontal: 18,
                            paddingVertical: 10,
                            borderRadius: 12,
                            marginBottom: 16,
                            borderWidth: 1,
                            borderColor: '#e7e5e4',
                        }}>
                            <Text style={{ fontSize: 17, fontWeight: '700', color: '#44403c' }}>{floorLabel}</Text>
                        </View>
                        <View style={{
                            backgroundImage: 'linear-gradient(135deg, #ffffff 0%, #fafaf9 100%)',
                            borderRadius: 20,
                            overflow: 'hidden',
                            borderWidth: 1,
                            borderColor: '#e7e5e4',
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.04,
                            shadowRadius: 12,
                        }}>
                            <View style={{
                                flexDirection: 'row',
                                backgroundImage: 'linear-gradient(135deg, #fafaf9 0%, #f5f5f4 100%)',
                                padding: 18,
                                borderBottomWidth: 1,
                                borderBottomColor: '#e7e5e4',
                            }}>
                                <Text style={{ flex: 2, fontWeight: '700', color: '#78716c', textTransform: 'uppercase', fontSize: 11, letterSpacing: 1 }}>Company Name</Text>
                                <Text style={{ flex: 2, fontWeight: '700', color: '#78716c', textTransform: 'uppercase', fontSize: 11, letterSpacing: 1 }}>Contact Email</Text>
                                <Text style={{ flex: 1, fontWeight: '700', color: '#78716c', textTransform: 'uppercase', fontSize: 11, letterSpacing: 1 }}>Status</Text>
                                <Text style={{ width: 90, fontWeight: '700', color: '#78716c', textTransform: 'uppercase', fontSize: 11, letterSpacing: 1 }}>Actions</Text>
                            </View>
                            {floorCompanies.map((company) => (
                                <View key={company.id} style={{ flexDirection: 'row', padding: 18, borderBottomWidth: 1, borderBottomColor: '#f5f5f4', alignItems: 'center' }}>
                                    <Text style={{ flex: 2, fontSize: 15, fontWeight: '600', color: '#1c1917' }}>{company.name}</Text>
                                    <Text style={{ flex: 2, color: '#44403c', fontSize: 14 }}>{company.contactEmail || '-'}</Text>
                                    <View style={{ flex: 1 }}>
                                        <View style={{
                                            backgroundImage: company.isActive ? 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)' : 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                                            paddingHorizontal: 10,
                                            paddingVertical: 6,
                                            borderRadius: 10,
                                            alignSelf: 'flex-start',
                                            borderWidth: 1,
                                            borderColor: company.isActive ? '#a7f3d0' : '#fecaca',
                                        }}>
                                            <Text style={{ color: company.isActive ? '#047857' : '#dc2626', fontSize: 12, fontWeight: '700' }}>
                                                {company.isActive ? 'Active' : 'Inactive'}
                                            </Text>
                                        </View>
                                    </View>
                                    <TextLink href={`/companies/${company.id}`}>
                                        <View style={{
                                            backgroundImage: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
                                            paddingHorizontal: 14,
                                            paddingVertical: 8,
                                            borderRadius: 10,
                                            borderWidth: 1,
                                            borderColor: '#fed7aa',
                                        }}>
                                            <Text style={{ color: '#E68B2C', fontSize: 13, fontWeight: '700' }}>Details</Text>
                                        </View>
                                    </TextLink>
                                </View>
                            ))}
                        </View>
                    </View>
                ))}

                {companies.length === 0 && !showForm && (
                    <View style={{
                        backgroundImage: 'linear-gradient(135deg, #ffffff 0%, #fafaf9 100%)',
                        borderRadius: 20,
                        padding: 64,
                        alignItems: 'center',
                        borderWidth: 2,
                        borderColor: '#e7e5e4',
                        borderStyle: 'dashed',
                    }}>
                        <View style={{
                            width: 80,
                            height: 80,
                            borderRadius: 40,
                            backgroundImage: 'linear-gradient(135deg, #f5f5f4 0%, #e7e5e4 100%)',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: 24,
                        }}>
                            <Text style={{ fontSize: 40 }}>🏢</Text>
                        </View>
                        <Text style={{ fontSize: 20, fontWeight: '800', color: '#1c1917', marginBottom: 8 }}>No companies registered yet</Text>
                        <Text style={{ color: '#78716c', marginBottom: 28, textAlign: 'center' }}>Start by adding companies to manage orders by office.</Text>
                        <Pressable
                            onPress={() => setShowForm(true)}
                            style={({ pressed }) => ({
                                backgroundImage: 'linear-gradient(135deg, #E68B2C 0%, #D97706 100%)',
                                paddingHorizontal: 28,
                                paddingVertical: 14,
                                borderRadius: 14,
                                shadowColor: '#E68B2C',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.3,
                                shadowRadius: 12,
                                opacity: pressed ? 0.95 : 1,
                            })}
                        >
                            <Text style={{ color: 'white', fontWeight: '700', fontSize: 15 }}>Register Your First Company</Text>
                        </Pressable>
                    </View>
                )}
            </View>
        </ScrollView>
    );
}
