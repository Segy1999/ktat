import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface PortfolioItem {
  id: number;
  title: string;
  description: string;
  image_url: string;
  created_at: string;
}

export function PortfolioManager() {
  const { toast } = useToast();
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    image_url: '',
  });

  useEffect(() => {
    fetchPortfolioItems();
  }, []);

  async function fetchPortfolioItems() {
    try {
      const { data, error } = await supabase
        .from('portfolio')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch portfolio items",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('portfolio')
        .insert([newItem]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Portfolio item added successfully",
      });

      setNewItem({ title: '', description: '', image_url: '' });
      await fetchPortfolioItems();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteItem(id: number) {
    try {
      const { error } = await supabase
        .from('portfolio')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Portfolio item deleted successfully",
      });

      await fetchPortfolioItems();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Portfolio Item</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddItem} className="space-y-4">
            <Input
              placeholder="Title"
              value={newItem.title}
              onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
              required
            />
            <Textarea
              placeholder="Description"
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              required
            />
            <Input
              placeholder="Image URL"
              value={newItem.image_url}
              onChange={(e) => setNewItem({ ...newItem, image_url: e.target.value })}
              required
            />
            <Button type="submit" disabled={loading}>
              Add Item
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <img
                src={item.image_url}
                alt={item.title}
                className="w-full h-48 object-cover rounded-md mb-4"
              />
              <p className="text-sm text-muted-foreground mb-4">
                {item.description}
              </p>
              <Button
                variant="destructive"
                onClick={() => handleDeleteItem(item.id)}
              >
                Delete
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
