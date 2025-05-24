"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AiSuggestionSchema, type AiSuggestionInput } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Lightbulb } from 'lucide-react';
import { suggestQrCodeContent, type SuggestQrCodeContentOutput } from '@/ai/flows/suggest-qr-code-content'; // Ensure correct path

interface AiSuggestionsProps {
  onSuggestionSelect: (suggestion: string) => void;
}

const AiSuggestions: React.FC<AiSuggestionsProps> = ({ onSuggestionSelect }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { toast } = useToast();

  const form = useForm<AiSuggestionInput>({
    resolver: zodResolver(AiSuggestionSchema),
    defaultValues: {
      prompt: '',
    },
  });

  const onSubmit = async (data: AiSuggestionInput) => {
    setIsLoading(true);
    setSuggestions([]);
    try {
      const result: SuggestQrCodeContentOutput = await suggestQrCodeContent({ userInput: data.prompt });
      if (result.suggestions && result.suggestions.length > 0) {
        setSuggestions(result.suggestions);
        toast({
          title: "Suggestions Ready!",
          description: "Here are some ideas for your QR code content.",
        });
      } else {
        toast({
          title: "No Suggestions Found",
          description: "Try a different prompt or be more specific.",
          variant: "default",
        });
      }
    } catch (error: any) {
      console.error("AI Suggestion error:", error);
      toast({
        title: "Suggestion Error",
        description: error.message || "Failed to get suggestions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Sparkles className="mr-2 h-5 w-5 text-primary" />
          AI Content Suggestions
        </CardTitle>
        <CardDescription>
          Not sure what to put in your QR code? Let AI help you brainstorm!
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="ai-prompt">Describe your QR code purpose (e.g., "my portfolio", "restaurant menu")</FormLabel>
                  <FormControl>
                    <Input id="ai-prompt" placeholder="Enter a topic or idea" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Lightbulb className="mr-2 h-4 w-4" />
              )}
              Get Suggestions
            </Button>
          </CardContent>
        </form>
      </Form>
      {suggestions.length > 0 && (
        <CardFooter className="flex-col items-start space-y-2 pt-4">
          <h4 className="font-semibold text-sm">Suggested Content:</h4>
          <ul className="list-disc list-inside space-y-1 w-full">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="text-sm">
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-left text-foreground hover:text-primary"
                  onClick={() => onSuggestionSelect(suggestion)}
                >
                  {suggestion}
                </Button>
              </li>
            ))}
          </ul>
        </CardFooter>
      )}
    </Card>
  );
};

export default AiSuggestions;
