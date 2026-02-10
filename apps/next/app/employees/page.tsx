'use client'

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { useEmployees, useCompanies, useCreateEmployee, useUpdateEmployee, useAuth } from '@my-app/api';
import { useRouter } from 'next/navigation';

export default function EmployeesPage() {
    const { user, companyId, companyName, isLoading: authLoading } = useAuth();
    const router = useRouter();

    const { data: employees = [], isLoading: employeesLoading } = useEmployees(companyId || undefined);
    const createEmployee = useCreateEmployee();
    const updateEmployee = useUpdateEmployee();

    const [showForm, setShowForm] = useState(false);
    const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [position, setPosition] = useState('');

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/');
        }
    }, [user, authLoading]);

    const displayHeader = companyName ? `@${companyName.replace(/\s+/g, '')}` : 'Company';

    const handleEditEmployee = (employee: any) => {
        setEditingEmployeeId(employee.id);
        setName(employee.name);
        setEmail(employee.email);
        setPhone(employee.phone || '');
        setPosition(employee.position || '');
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSaveEmployee = async () => {
        if (!companyId) return;
        if (!name || !email) {
            alert('Please fill in required fields (Name, Email)');
            return;
        }

        try {
            if (editingEmployeeId) {
                await updateEmployee.mutateAsync({ id: editingEmployeeId, name, email, phone, position });
                alert('Employee updated successfully!');
            } else {
                await createEmployee.mutateAsync({ name, email, phone, companyId, position });
                alert('Employee added successfully!');
            }
            setShowForm(false);
            setEditingEmployeeId(null);
            setName('');
            setEmail('');
            setPhone('');
            setPosition('');
        } catch (error) {
            console.error('Error saving employee:', error);
            alert('Failed to save employee. Email might already be registered.');
        }
    };

    if (authLoading || employeesLoading) {
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
                <Text style={{ fontSize: 15, color: '#78716c', fontWeight: '600' }}>Verifying authorization...</Text>
            </View>
        );
    }

    if (!user || !companyId) return null;

    return (
        <ScrollView
            style={{ flex: 1, backgroundImage: 'linear-gradient(180deg, #fafaf9 0%, #f5f5f4 50%, #e7e5e4 100%)' }}
            contentContainerStyle={{ alignItems: 'center', paddingVertical: 40 }}
        >
            <View style={{ maxWidth: 1280, width: '100%', padding: 40, alignItems: 'center' }}>
                <View style={{ alignItems: 'center', marginBottom: 48, width: '100%' }}>
                    <Text style={{
                        fontSize: 44,
                        fontWeight: '900',
                        color: '#1c1917',
                        letterSpacing: -1,
                        textAlign: 'center',
                        marginBottom: 12,
                    }}>
                        {displayHeader} Staff
                    </Text>
                    <Text style={{ color: '#78716c', fontSize: 18, fontWeight: '500', textAlign: 'center', marginBottom: 32 }}>
                        Manage your office team and their contact details
                    </Text>

                    <Pressable
                        onPress={() => {
                            if (showForm) {
                                setShowForm(false);
                                setEditingEmployeeId(null);
                                setName('');
                                setEmail('');
                                setPhone('');
                                setPosition('');
                            } else {
                                setShowForm(true);
                            }
                        }}
                        style={({ pressed }) => ({
                            backgroundImage: showForm
                                ? 'linear-gradient(135deg, #f5f5f4 0%, #e7e5e4 100%)'
                                : 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                            paddingHorizontal: 28,
                            paddingVertical: 14,
                            borderRadius: 14,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: showForm ? 0 : 0.15,
                            shadowRadius: 12,
                            opacity: pressed ? 0.95 : 1,
                        })}
                    >
                        <Text style={{
                            color: showForm ? '#78716c' : 'white',
                            fontWeight: '700',
                            fontSize: 15,
                        }}>
                            {showForm ? 'Cancel Registration' : '+ Register New Employee'}
                        </Text>
                    </Pressable>
                </View>

                {showForm && (
                    <View style={{
                        backgroundImage: 'linear-gradient(135deg, #ffffff 0%, #fafaf9 100%)',
                        borderRadius: 20,
                        padding: 32,
                        marginBottom: 32,
                        borderWidth: 1,
                        borderColor: '#e7e5e4',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.05,
                        shadowRadius: 16,
                        width: '100%',
                        maxWidth: 900,
                    }}>
                        <Text style={{ fontSize: 20, fontWeight: '800', marginBottom: 24, color: '#1c1917' }}>
                            {editingEmployeeId ? 'Edit Team Member' : 'Add New Team Member'}
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 20, flexWrap: 'wrap' }}>
                            {[
                                { label: 'Full Name *', value: name, set: setName, placeholder: 'e.g. Sarah Wilson', key: 'name' },
                                { label: 'Work Email *', value: email, set: setEmail, placeholder: 'sarah@yourcompany.com', key: 'email', keyboardType: 'email-address' as const },
                                { label: 'Phone Number', value: phone, set: setPhone, placeholder: 'e.g. +251 9XX XXX XXX', key: 'phone', keyboardType: 'phone-pad' as const },
                                { label: 'Position/Role', value: position, set: setPosition, placeholder: 'e.g. Account Manager', key: 'position' },
                            ].map(({ label, value, set, placeholder, key, keyboardType }) => (
                                <View key={key} style={{ flex: 1, minWidth: 280 }}>
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
                        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 32 }}>
                            <Pressable
                                onPress={handleSaveEmployee}
                                style={({ pressed }) => ({
                                    backgroundImage: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                                    paddingHorizontal: 28,
                                    paddingVertical: 14,
                                    borderRadius: 12,
                                    shadowColor: '#059669',
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.25,
                                    shadowRadius: 12,
                                    opacity: pressed ? 0.95 : 1,
                                })}
                            >
                                <Text style={{ color: 'white', fontWeight: '700', fontSize: 15 }}>
                                    {editingEmployeeId ? 'Update Employee' : 'Save Employee Details'}
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                )}

                <View style={{
                    backgroundImage: 'linear-gradient(135deg, #ffffff 0%, #fafaf9 100%)',
                    borderRadius: 20,
                    overflow: 'hidden',
                    borderWidth: 1,
                    borderColor: '#e7e5e4',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.04,
                    shadowRadius: 16,
                    width: '100%',
                }}>
                    <View style={{
                        flexDirection: 'row',
                        backgroundImage: 'linear-gradient(135deg, #fafaf9 0%, #f5f5f4 100%)',
                        padding: 20,
                        borderBottomWidth: 1,
                        borderBottomColor: '#e7e5e4',
                    }}>
                        <Text style={{ flex: 2, fontWeight: '700', color: '#78716c', textTransform: 'uppercase', fontSize: 11, letterSpacing: 1 }}>Staff Member</Text>
                        <Text style={{ flex: 2, fontWeight: '700', color: '#78716c', textTransform: 'uppercase', fontSize: 11, letterSpacing: 1 }}>Contact Information</Text>
                        <Text style={{ flex: 1.5, fontWeight: '700', color: '#78716c', textTransform: 'uppercase', fontSize: 11, letterSpacing: 1 }}>Role</Text>
                        <Text style={{ width: 100, fontWeight: '700', color: '#78716c', textTransform: 'uppercase', fontSize: 11, letterSpacing: 1, textAlign: 'right' }}>Action</Text>
                    </View>
                    {employees.map((employee) => (
                        <View
                            key={employee.id}
                            style={{
                                flexDirection: 'row',
                                padding: 20,
                                borderBottomWidth: 1,
                                borderBottomColor: '#f5f5f4',
                                alignItems: 'center',
                            }}
                        >
                            <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center' }}>
                                <View style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 22,
                                    backgroundImage: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: 16,
                                    borderWidth: 1,
                                    borderColor: '#fed7aa',
                                }}>
                                    <Text style={{ fontSize: 18, fontWeight: '800', color: '#E68B2C' }}>{employee.name[0]}</Text>
                                </View>
                                <View>
                                    <Text style={{ fontSize: 16, fontWeight: '700', color: '#1c1917' }}>{employee.name}</Text>
                                    <Text style={{ fontSize: 12, color: '#78716c' }}>ID: {employee.id.slice(0, 8)}</Text>
                                </View>
                            </View>
                            <View style={{ flex: 2 }}>
                                <Text style={{ color: '#1c1917', fontWeight: '500' }}>{employee.email}</Text>
                                <Text style={{ color: '#78716c', fontSize: 13 }}>{employee.phone || 'No phone added'}</Text>
                            </View>
                            <View style={{ flex: 1.5 }}>
                                <View style={{
                                    backgroundImage: 'linear-gradient(135deg, #f5f5f4 0%, #e7e5e4 100%)',
                                    paddingHorizontal: 12,
                                    paddingVertical: 6,
                                    borderRadius: 10,
                                    alignSelf: 'flex-start',
                                    borderWidth: 1,
                                    borderColor: '#e7e5e4',
                                }}>
                                    <Text style={{ color: '#44403c', fontSize: 13, fontWeight: '600' }}>{employee.position || 'Staff'}</Text>
                                </View>
                            </View>
                            <Pressable onPress={() => handleEditEmployee(employee)} style={{ width: 100, alignItems: 'flex-end' }}>
                                <View style={{
                                    backgroundImage: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
                                    paddingHorizontal: 16,
                                    paddingVertical: 10,
                                    borderRadius: 10,
                                    borderWidth: 1,
                                    borderColor: '#fed7aa',
                                }}>
                                    <Text style={{ color: '#E68B2C', fontSize: 14, fontWeight: '700' }}>Edit</Text>
                                </View>
                            </Pressable>
                        </View>
                    ))}
                    {employees.length === 0 && (
                        <View style={{ padding: 64, alignItems: 'center' }}>
                            <View style={{
                                width: 80,
                                height: 80,
                                borderRadius: 40,
                                backgroundImage: 'linear-gradient(135deg, #f5f5f4 0%, #e7e5e4 100%)',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 24,
                            }}>
                                <Text style={{ fontSize: 40 }}>👥</Text>
                            </View>
                            <Text style={{ color: '#1c1917', fontSize: 20, fontWeight: '700', marginBottom: 8 }}>No staff members registered</Text>
                            <Text style={{ color: '#78716c', fontSize: 15, textAlign: 'center', maxWidth: 400 }}>
                                Start building your team at {companyName || 'your company'} by adding your first employee.
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </ScrollView>
    );
}
