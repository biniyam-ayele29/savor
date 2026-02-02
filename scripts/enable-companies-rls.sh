#!/bin/bash

# Script to enable RLS policies for companies table

echo "Applying RLS policies for companies table..."

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "Error: .env.local file not found!"
    exit 1
fi

# Load environment variables
export $(cat .env.local | grep -v '^#' | xargs)

# Extract project ref from Supabase URL
PROJECT_REF=$(echo $NEXT_PUBLIC_SUPABASE_URL | sed 's/https:\/\/\([^.]*\).*/\1/')

echo "Project: $PROJECT_REF"
echo ""

# Check if supabase CLI is available
if ! command -v supabase &> /dev/null; then
    echo "Warning: Supabase CLI not found. Please run the SQL manually in Supabase SQL Editor:"
    echo ""
    cat supabase/enable_companies_rls.sql
    echo ""
    echo "Or install Supabase CLI: https://supabase.com/docs/guides/cli"
    exit 0
fi

# Run the SQL file
echo "Running SQL migration..."
supabase db execute --project-ref $PROJECT_REF --file supabase/enable_companies_rls.sql

echo "Done! Companies table RLS policies enabled."
