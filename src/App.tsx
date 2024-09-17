import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Search,
  Clipboard,
  RotateCcw,
  Link,
  Sun,
  Moon,
  History,
  RectangleEllipsis,
  CircleX,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { useTheme } from "./ThemeContext";
import { useToast } from "./hooks/use-toast";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const formSchema = z.object({
  base: z.string().min(1, "Enter at least one keyword"),
  exactMatch: z.string().optional(),
  exclude: z.string().optional(),
  domain: z.string().optional(),
  termsAppearing: z.string().optional().default("any"),
  fileType: z.string().optional().default("any"),
});

function ThemeToggle() {
  const { isDarkTheme, toggleTheme } = useTheme();

  return (
    <Button
      onClick={toggleTheme}
      variant="outline"
      size="icon"
      className="absolute top-4 right-4"
    >
      {isDarkTheme ? (
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem]" />
      )}
    </Button>
  );
}

function addToHistory(query: {
  base: string;
  exactMatch: string;
  exclude: string;
  domain: string;
  termsAppearing: string;
  fileType: string;
}) {
  const history = JSON.parse(localStorage.getItem("history") || "[]");

  if (history.includes(query)) {
    return;
  }

  history.push(query);
  localStorage.setItem("history", JSON.stringify(history));
}

function generateSearchString(values: z.infer<typeof formSchema>) {
  let searchString = "";

  switch (values.termsAppearing) {
    case "title":
      searchString += "allintitle: ";
      break;
    case "text":
      searchString += "allintext: ";
      break;
    case "url":
      searchString += "allinurl: ";
      break;
    case "links":
      searchString += "allinanchor: ";
      break;
  }

  searchString += values.base;

  if (values.exactMatch) {
    values.exactMatch.split(",").forEach((word) => {
      word.length > 0 && (searchString += ` "${word.trim()}"`);
    });
  }

  if (values.exclude) {
    values.exclude.split(",").forEach((word) => {
      word.length > 0 && (searchString += ` -"${word.trim()}"`);
    });
  }

  if (values.domain) {
    searchString += ` site:${values.domain}`;
  }

  if (values.fileType !== "any") {
    searchString += ` filetype:${values.fileType}`;
  }

  return searchString;
}

function App() {
  const [searchString, setSearchString] = useState("");
  const { isDarkTheme } = useTheme();
  const { toast } = useToast();
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    const history = JSON.parse(localStorage.getItem("history") || "[]");
    setHistory(history);
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      base: "",
      exactMatch: "",
      exclude: "",
      domain: "",
      termsAppearing: "any",
      fileType: "any",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const searchString = generateSearchString(values);

    setSearchString(searchString);
    addToHistory(values as any);
    const history = JSON.parse(localStorage.getItem("history") || "[]");
    setHistory(history);
  }

  function onReset() {
    setSearchString("");
    form.reset({
      base: "",
      exactMatch: "",
      exclude: "",
      domain: "",
      termsAppearing: "any",
      fileType: "any",
    });
  }

  return (
    <div className={`min-h-screen ${isDarkTheme ? "dark" : ""}`}>
      <main className="max-w-4xl mx-auto p-6 space-y-6 relative">
        <ThemeToggle />
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          Advanced Google Search Query Builder
        </h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="base"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Search</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter search keywords" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter your search keywords here.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
              Refine your query
            </h2>
            <FormField
              control={form.control}
              name="exactMatch"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exact match</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Exact words or phrases to match"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter keywords or phrases that must be present in the search
                    results, separated by commas.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="exclude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exclude</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Words or phrases to exclude"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter keywords or phrases to exclude from search results,
                    separated by commas.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="domain"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Domain</FormLabel>
                  <FormControl>
                    <Input placeholder="example.com" {...field} />
                  </FormControl>
                  <FormDescription>
                    See results only from a specific domain or website.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="termsAppearing"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Terms appearing</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={form.getValues("termsAppearing")}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="any">Anywhere in the page</SelectItem>
                      <SelectItem value="title">
                        In the title of the page
                      </SelectItem>
                      <SelectItem value="text">
                        In the text of the page
                      </SelectItem>
                      <SelectItem value="url">
                        In the URL of the page
                      </SelectItem>
                      <SelectItem value="links">
                        In links to the page
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Search for terms in the whole page, page title, or web
                    address, or links to the page you're looking for.
                  </FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fileType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>File type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={form.getValues("fileType")}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="any">Any format</SelectItem>
                      <SelectItem value="pdf">
                        Adobe Acrobat PDF (.pdf)
                      </SelectItem>
                      <SelectItem value="ps">Adobe PostScript (.ps)</SelectItem>
                      <SelectItem value="dwf">Autodesk DWF (.dwf)</SelectItem>
                      <SelectItem value="kml">
                        Google Earth KML (.kml)
                      </SelectItem>
                      <SelectItem value="kmz">
                        Google Earth KMZ (.kmz)
                      </SelectItem>
                      <SelectItem value="xls">
                        Microsoft Excel (.xls)
                      </SelectItem>
                      <SelectItem value="ppt">
                        Microsoft PowerPoint (.ppt)
                      </SelectItem>
                      <SelectItem value="doc">Microsoft Word (.doc)</SelectItem>
                      <SelectItem value="rtf">
                        Rich Text Format (.rtf)
                      </SelectItem>
                      <SelectItem value="swf">
                        Shockwave Flash (.swf)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Find results in a specific file format.
                  </FormDescription>
                </FormItem>
              )}
            />
            <Button type="submit" className="mr-2">
              <Search className="mr-2 h-4 w-4" /> Generate search string
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onReset}
              className="mr-2"
            >
              <RotateCcw className="mr-2 h-4 w-4" /> Reset
            </Button>
            <Dialog>
              <DialogTrigger className="flex items-center gap-2 hover:underline">
                <History />
                History
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex gap-2 items-center">
                    Search History <History />
                  </DialogTitle>
                </DialogHeader>
                <DialogDescription>
                  <ul className="flex flex-col gap-4">
                    {history.map((query, index) => (
                      <li
                        key={index}
                        className="flex justify-between items-center gap-2"
                      >
                        {generateSearchString(query as any)}
                        <div className="actions flex gap-2">
                          <DialogClose asChild>
                            <Button
                              onClick={() => {
                                form.reset(query as any);
                                setSearchString(
                                  generateSearchString(query as any)
                                );
                              }}
                            >
                              <RectangleEllipsis className="mr-2 h-4 w-4" />{" "}
                              Autofill
                            </Button>
                          </DialogClose>
                          <Button
                            variant="outline"
                            onClick={() => {
                              navigator.clipboard.writeText(
                                generateSearchString(query as any)
                              );
                              toast({
                                title: "Search query copied to clipboard",
                                description: `${generateSearchString(
                                  query as any
                                )}`,
                              });
                            }}
                          >
                            <Clipboard className="mr-2 h-4 w-4" /> Copy
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </DialogDescription>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="destructive" className="w-full" onClick={() => {
                      localStorage.removeItem("history");
                      setHistory([]);
                      
                    }}>
                      <CircleX className="mr-2 h-4 w-4" />
                      Clear History
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </form>
        </Form>
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">
            Your custom search query:
          </h2>
          <div className="p-4 bg-gray-100 rounded-md dark:bg-gray-800">
            <p className="mb-4">
              {searchString || "Your custom search query will appear here"}
            </p>
            <Button
              variant="outline"
              onClick={() => {
                if (!searchString) {
                  toast({
                    variant: "destructive",
                    title: "No search query to copy",
                    description: "Generate a search query first",
                  });
                  return;
                }
                navigator.clipboard.writeText(searchString);
                toast({
                  title: "Search query copied to clipboard",
                  description: `${searchString}`,
                });
              }}
            >
              <Clipboard className="mr-2 h-4 w-4" /> Copy to clipboard
            </Button>
            <Button variant="link">
              <a
                href={`https://www.google.com/search?q=${encodeURIComponent(
                  searchString
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center"
              >
                <Link className="mr-2 h-4 w-4" /> Open in Google
              </a>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
