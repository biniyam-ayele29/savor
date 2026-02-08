'use client'

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, Platform } from 'react-native';
import { supabase } from '@my-app/api';
import { useRouter } from 'next/navigation';

export function RegisterForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [companies, setCompanies] = useState<any[]>([]);
    const [selectedCompany, setSelectedCompany] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchCompanies = async () => {
            const { data, error } = await supabase.from('companies').select('id, name').eq('is_active', true);
            if (data) {
                setCompanies(data);
            }
            if (error) {
                console.error('Error fetching companies:', error);
            }
        };
        fetchCompanies();
    }, []);

    const handleRegister = async () => {
        if (!email || !password || !confirmPassword || !fullName || !selectedCompany || !phoneNumber) {
            alert('Please fill in all fields');
            return;
        }

        if (password.length < 6) {
            alert('Password must be at least 6 characters');
            return;
        }

        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        setIsLoading(true);
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        phone_number: phoneNumber,
                        company_id: selectedCompany
                    }
                }
            });

            if (error) throw error;

            alert('Registration successful! You can now log in.');
            router.push('/login');
        } catch (error: any) {
            console.error('Registration error:', error.message);
            alert(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={{ gap: 20, width: '100%' }}>
            <View>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 8, textTransform: 'uppercase' }}>Full Name</Text>
                <TextInput
                    style={{ backgroundColor: '#f9fafb', padding: 16, borderRadius: 12, border: '2px solid #e5e7eb', fontSize: 16 }}
                    placeholder="e.g. John Doe"
                    value={fullName}
                    onChangeText={setFullName}
                />
            </View>

            <View>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 8, textTransform: 'uppercase' }}>Phone Number</Text>
                <TextInput
                    style={{ backgroundColor: '#f9fafb', padding: 16, borderRadius: 12, border: '2px solid #e5e7eb', fontSize: 16 }}
                    placeholder="+1234567890"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                />
            </View>

            <View>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 8, textTransform: 'uppercase' }}>Company</Text>
                {Platform.OS === 'web' ? (
                    <select
                        style={{
                            backgroundColor: '#f9fafb',
                            padding: 16,
                            borderRadius: 12,
                            border: '2px solid #e5e7eb',
                            fontSize: 16,
                            width: '100%',
                            appearance: 'none',
                            outline: 'none'
                        }}
                        value={selectedCompany}
                        onChange={(e) => setSelectedCompany(e.target.value)}
                    >
                        <option value="">Select your company</option>
                        {companies.map((company) => (
                            <option key={company.id} value={company.id}>
                                {company.name}
                            </option>
                        ))}
                    </select>
                ) : (
                    <Text>Company selection not supported on native yet</Text>
                )}
            </View>

            <View>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 8, textTransform: 'uppercase' }}>Work Email (name@company.com)</Text>
                <TextInput
                    style={{ backgroundColor: '#f9fafb', padding: 16, borderRadius: 12, border: '2px solid #e5e7eb', fontSize: 16 }}
                    placeholder="alice@techinnovators.com"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />
            </View>

            <View>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 8, textTransform: 'uppercase' }}>Create Password</Text>
                <TextInput
                    style={{ backgroundColor: '#f9fafb', padding: 16, borderRadius: 12, border: '2px solid #e5e7eb', fontSize: 16 }}
                    placeholder="••••••••"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
            </View>

            <View>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 8, textTransform: 'uppercase' }}>Confirm Password</Text>
                <TextInput
                    style={{ backgroundColor: '#f9fafb', padding: 16, borderRadius: 12, border: '2px solid #e5e7eb', fontSize: 16 }}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                />
            </View>

            <Pressable
                onPress={handleRegister}
                disabled={isLoading}
                style={{ backgroundColor: '#ea580c', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10, opacity: isLoading ? 0.7 : 1 }}
            >
                {isLoading ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Register Account</Text>}
            </Pressable>
        </View>
    );
}
