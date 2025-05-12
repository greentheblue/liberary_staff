"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Building2,
  Search,
  Phone,
  User,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";

type Entity = {
  id: string;
  name: string;
  address: string;
  type: string;
  headPerson: {
    name: string;
    phone: string | null;
    address: string | null;
  };
  contactPerson: {
    name: string;
    phone: string;
    address: string;
  };
};

export default function EntityList() {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [filteredEntities, setFilteredEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchEntities = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/entities");
        const data = await response.json();
        setEntities(data.entities);
        setFilteredEntities(data.entities);
      } catch (error) {
        console.error("Failed to fetch entities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEntities();
  }, []);

  useEffect(() => {
    if (search.length >= 3) {
      const searchLower = search.toLowerCase();
      const filtered = entities.filter(
        (entity) =>
          entity.id.toLowerCase().includes(searchLower) ||
          entity.name.toLowerCase().includes(searchLower)
      );
      setFilteredEntities(filtered);
      setCurrentPage(1);
    } else {
      setFilteredEntities(entities);
    }
  }, [search, entities]);

  const totalPages = Math.ceil(filteredEntities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEntities = filteredEntities.slice(startIndex, endIndex);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
    },
  };

  return (
    <motion.div
      className="container mx-auto py-10 px-4"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            Entity List
          </CardTitle>
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by ID or name (min. 3 characters)..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">ID</TableHead>
                    <TableHead className="w-[200px]">Entity Name</TableHead>
                    <TableHead className="w-[150px]">Type</TableHead>
                    <TableHead className="w-[200px]">Address</TableHead>
                    <TableHead className="w-[250px]">Head Person</TableHead>
                    <TableHead className="w-[250px]">Contact Person</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : currentEntities.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No entities found matching your search
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentEntities.map((entity) => (
                      <motion.tr
                        key={entity.id}
                        variants={itemVariants}
                        className="border-b transition-colors hover:bg-muted/50"
                      >
                        <TableCell className="font-mono text-sm">
                          <div className="flex items-center gap-2">
                            {entity.id}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {entity.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="capitalize">{entity.type.replace('_', ' ')}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {entity.address}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              {entity.headPerson.name}
                            </div>
                            {entity.headPerson.phone && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                {entity.headPerson.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              {entity.contactPerson.name}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {entity.contactPerson.phone}
                            </div>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => prev - 1)}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={currentPage >= totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}