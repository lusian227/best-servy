// src/pages/RecordsPage.tsx
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Search } from 'lucide-react'

export const RecordsPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Records</h1>
          <p className="text-gray-500">Manage your engineering records</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Record
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search records..."
                className="w-full rounded-md border border-gray-200 bg-white px-10 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              />
            </div>
            <Button variant="outline">Filter</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
