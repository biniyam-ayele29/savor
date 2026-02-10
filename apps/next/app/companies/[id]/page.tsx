import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { useCompanies, useEmployees, useOrders, useCompanyAdmins, useCreateCompanyAdmin } from '@my-app/api';
import { createParam } from 'solito';
import { OrderCard } from 'app/features/orders/order-card';

const { useParam } = createParam<{ id: string }>();

export default function CompanyDetailPage() {
    const [id] = useParam('id');
    const { data: companies = [] } = useCompanies();
    const company = companies.find(c => c.id === id);
    const { data: employees = [] } = useEmployees(id);
    const { data: orders = [] } = useOrders();
    const { data: admins = [], isLoading: adminsLoading } = useCompanyAdmins(id || '');
    const createAdmin = useCreateCompanyAdmin();

    const [adminView, setAdminView] = useState<'employees' | 'orders' | 'admins'>('employees');
    const [newAdminEmail, setNewAdminEmail] = useState('');
    const [newAdminPassword, setNewAdminPassword] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const companyOrders = orders.filter(o => o.companyId === id);

    const handleAddAdmin = async () => {
        if (!newAdminEmail || !newAdminPassword) {
            alert('Please provide both email and password');
            return;
        }

        if (newAdminPassword.length < 6) {
            alert('Password must be at least 6 characters');
            return;
        }

        setIsCreating(true);
        try {
            await createAdmin.mutateAsync({
                email: newAdminEmail,
                password: newAdminPassword,
                companyId: id || ''
            });
            setNewAdminEmail('');
            setNewAdminPassword('');
            alert('Admin created successfully!');
        } catch (error) {
            console.error('Error creating admin:', error);
            alert('Failed to create admin. User might already exist.');
        } finally {
            setIsCreating(false);
        }
    };

    if (!company) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 24, color: '#6b7280' }}>Company not found</Text>
            </View>
        );
    }

    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
            <View style={{ maxWidth: 1200, marginHorizontal: 'auto', width: '100%', padding: 40 }}>
                {/* Company Header Card */}
                <View style={{ backgroundColor: 'white', borderRadius: 24, padding: 32, marginBottom: 40, border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                        <View>
                            <Text style={{ fontSize: 40, fontWeight: '900', color: '#111827', letterSpacing: -1.5 }}>{company.name}</Text>
                            <Text style={{ fontSize: 20, color: '#6b7280', fontWeight: '500' }}>Floor {company.floorNumber}</Text>
                        </View>
                        <View style={{ backgroundColor: company.isActive ? '#ecfdf5' : '#fef2f2', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, border: `1px solid ${company.isActive ? '#a7f3d0' : '#fecaca'}` }}>
                            <Text style={{ color: company.isActive ? '#059669' : '#dc2626', fontWeight: '800', fontSize: 14 }}>
                                {company.isActive ? 'ACTIVE CLIENT' : 'INACTIVE'}
                            </Text>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', gap: 64, borderTop: '1px solid #f3f4f6', paddingTop: 28 }}>
                        <View>
                            <Text style={{ color: '#9ca3af', textTransform: 'uppercase', fontSize: 13, fontWeight: '800', letterSpacing: 1, marginBottom: 8 }}>CONTACT EMAIL</Text>
                            <Text style={{ color: '#1f2937', fontSize: 18, fontWeight: '600' }}>{company.contactEmail || 'No email provided'}</Text>
                        </View>
                        <View>
                            <Text style={{ color: '#9ca3af', textTransform: 'uppercase', fontSize: 13, fontWeight: '800', letterSpacing: 1, marginBottom: 8 }}>CONTACT PHONE</Text>
                            <Text style={{ color: '#1f2937', fontSize: 18, fontWeight: '600' }}>{company.contactPhone || 'No phone provided'}</Text>
                        </View>
                        <View>
                            <Text style={{ color: '#9ca3af', textTransform: 'uppercase', fontSize: 13, fontWeight: '800', letterSpacing: 1, marginBottom: 8 }}>TOTAL STAFF</Text>
                            <Text style={{ color: '#1f2937', fontSize: 18, fontWeight: '800' }}>{employees.length}</Text>
                        </View>
                    </View>
                </View>

                {/* Sub-Navigation Tabs */}
                <View style={{ flexDirection: 'row', gap: 12, marginBottom: 32 }}>
                    {[
                        { id: 'employees', label: 'Employees 👥', count: employees.length },
                        { id: 'orders', label: 'Order History 🛒', count: companyOrders.length },
                        { id: 'admins', label: 'Company Admins 🛡️', count: admins.length }
                    ].map((tab) => (
                        <Pressable
                            key={tab.id}
                            onPress={() => setAdminView(tab.id as any)}
                            style={{
                                paddingHorizontal: 24,
                                paddingVertical: 14,
                                borderRadius: 16,
                                backgroundColor: adminView === tab.id ? '#111827' : 'white',
                                borderWidth: 1,
                                borderColor: adminView === tab.id ? '#111827' : '#e5e7eb',
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: adminView === tab.id ? 0.1 : 0,
                                shadowRadius: 4,
                            }}
                        >
                            <Text style={{ color: adminView === tab.id ? 'white' : '#6b7280', fontWeight: '800', fontSize: 15 }}>
                                {tab.label} ({tab.count})
                            </Text>
                        </Pressable>
                    ))}
                </View>

                <View style={{ gap: 40 }}>
                    {/* View: Employees */}
                    {adminView === 'employees' && (
                        <View>
                            <View style={{ backgroundColor: 'white', borderRadius: 24, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                                {employees.map((emp, idx) => (
                                    <View key={emp.id} style={{ padding: 24, borderBottom: idx === employees.length - 1 ? 0 : '1px solid #f3f4f6', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                                            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' }}>
                                                <Text style={{ fontSize: 20 }}>👤</Text>
                                            </View>
                                            <View>
                                                <Text style={{ fontWeight: '800', fontSize: 17, color: '#111827' }}>{emp.name}</Text>
                                                <Text style={{ fontSize: 14, color: '#6b7280', fontWeight: '500' }}>{emp.position || 'Staff Member'}</Text>
                                            </View>
                                        </View>
                                        <Text style={{ fontSize: 14, color: '#6b7280', fontWeight: '600' }}>{emp.email}</Text>
                                    </View>
                                ))}
                                {employees.length === 0 && (
                                    <View style={{ padding: 64, alignItems: 'center' }}>
                                        <Text style={{ color: '#9ca3af', fontSize: 18, fontWeight: '500' }}>No employees registered for this company.</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    )}

                    {/* View: Orders */}
                    {adminView === 'orders' && (
                        <View>
                            <View style={{ gap: 16 }}>
                                {companyOrders.map(order => (
                                    <OrderCard key={order.id} order={order} />
                                ))}
                                {companyOrders.length === 0 && (
                                    <View style={{ backgroundColor: 'white', borderRadius: 24, padding: 64, alignItems: 'center', border: '1px solid #e5e7eb' }}>
                                        <Text style={{ color: '#9ca3af', fontSize: 18, fontWeight: '500' }}>No order history yet.</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    )}

                    {/* View: Company Admins (THE NEW STUFF) */}
                    {adminView === 'admins' && (
                        <View style={{ flexDirection: 'row', gap: 32 }}>
                            {/* Admin List */}
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 22, fontWeight: '900', marginBottom: 20, color: '#111827' }}>Current Administrators</Text>
                                <View style={{ backgroundColor: 'white', borderRadius: 24, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                                    {adminsLoading ? (
                                        <View style={{ padding: 48 }}><ActivityIndicator color="#E68B2C" /></View>
                                    ) : admins.length > 0 ? (
                                        admins.map((adm, idx) => (
                                            <View key={adm.id} style={{ padding: 24, borderBottom: idx === admins.length - 1 ? 0 : '1px solid #f3f4f6', flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                                                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Text style={{ fontSize: 20 }}>🛡️</Text>
                                                </View>
                                                <View>
                                                    <Text style={{ fontWeight: '800', fontSize: 17, color: '#111827' }}>{adm.email}</Text>
                                                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                                                        <View style={{ backgroundColor: '#f3f4f6', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                                                            <Text style={{ fontSize: 11, fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>{adm.role || 'Admin'}</Text>
                                                        </View>
                                                    </View>
                                                </View>
                                            </View>
                                        ))
                                    ) : (
                                        <View style={{ padding: 48, alignItems: 'center' }}>
                                            <Text style={{ color: '#9ca3af' }}>No company admins assigned.</Text>
                                        </View>
                                    )}
                                </View>
                            </View>

                            {/* Add Admin Form */}
                            <View style={{ width: 400 }}>
                                <View style={{ backgroundColor: 'white', borderRadius: 24, padding: 32, border: '1px solid #e5e7eb', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 16 }}>
                                    <Text style={{ fontSize: 22, fontWeight: '900', color: '#111827', marginBottom: 8 }}>Add Administrator</Text>
                                    <Text style={{ color: '#6b7280', fontSize: 14, fontWeight: '600', marginBottom: 28 }}>Securely onboard a new company manager</Text>

                                    <View style={{ gap: 20 }}>
                                        <View>
                                            <Text style={{ fontSize: 13, fontWeight: '800', color: '#374151', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Email Address</Text>
                                            <TextInput
                                                style={{ backgroundColor: '#f9fafb', padding: 16, borderRadius: 14, border: '1px solid #e5e7eb', fontSize: 15, fontWeight: '600' }}
                                                placeholder="admin@company.com"
                                                value={newAdminEmail}
                                                onChangeText={setNewAdminEmail}
                                                autoCapitalize="none"
                                            />
                                        </View>
                                        <View>
                                            <Text style={{ fontSize: 13, fontWeight: '800', color: '#374151', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Hard-coded Password</Text>
                                            <TextInput
                                                style={{ backgroundColor: '#f9fafb', padding: 16, borderRadius: 14, border: '1px solid #e5e7eb', fontSize: 15, fontWeight: '600' }}
                                                placeholder="••••••••"
                                                secureTextEntry
                                                value={newAdminPassword}
                                                onChangeText={setNewAdminPassword}
                                            />
                                        </View>

                                        <Pressable
                                            onPress={handleAddAdmin}
                                            disabled={isCreating}
                                            style={{
                                                backgroundColor: '#E68B2C',
                                                padding: 18,
                                                borderRadius: 14,
                                                alignItems: 'center',
                                                marginTop: 12,
                                                opacity: isCreating ? 0.7 : 1,
                                                shadowColor: '#E68B2C',
                                                shadowOffset: { width: 0, height: 4 },
                                                shadowOpacity: 0.2,
                                                shadowRadius: 10,
                                            }}
                                        >
                                            {isCreating ? (
                                                <ActivityIndicator color="white" />
                                            ) : (
                                                <Text style={{ color: 'white', fontWeight: '800', fontSize: 16 }}>Authorize Admin Account</Text>
                                            )}
                                        </Pressable>
                                        <Text style={{ color: '#9ca3af', fontSize: 12, textAlign: 'center', fontWeight: '500', lineHeight: 18 }}>
                                            This will create a new login account and link it exclusively to this company's dashboard.
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    )}
                </View>
            </View>
        </ScrollView>
    );
}
