"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

interface Member {
  id: string;
  name: string;
  memberType: string;
  gender: string;
  phoneNumber: string;
  address: string;
  class?: string;
  division?: string;
}

interface Book {
  id: string;
  title: string;
  author: string;
  availableCopies: number;
  category: {
    name: string;
  };
}

interface IssuedBookItem {
  id: string;
  bookId: string;
  collected: boolean;
  book: Book;
}

interface IssuedBook {
  id: string;
  issueDate: string;
  memberId: string;
  items: IssuedBookItem[];
}

export default function Dashboard() {
  const [memberId, setMemberId] = useState("");
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(false);
  const [bookId, setBookId] = useState("");
  const [selectedBooks, setSelectedBooks] = useState<Book[]>([]);
  const [searchingBook, setSearchingBook] = useState(false);
  const [showIssueSection, setShowIssueSection] = useState(false);
  const [issuingBooks, setIssuingBooks] = useState(false);
  const [memberIssuedBooks, setMemberIssuedBooks] = useState<IssuedBook[]>([]);

  const searchMember = async () => {
    if (!memberId) {
      toast.error("Please enter a member ID");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/dashboard/members/${memberId}`);
      if (!response.ok) {
        throw new Error("Member not found");
      }

      const data = await response.json();
      setMember(data.member);
      setMemberIssuedBooks(data.issuedBooks || []);
    } catch (error) {
      console.error("Error fetching member:", error);
      toast.error("Failed to find member");
      setMember(null);
      setMemberIssuedBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const searchBook = async () => {
    if (!bookId) {
      toast.error("Please enter a book ID");
      return;
    }

    setSearchingBook(true);
    try {
      const response = await fetch(`/api/dashboard/books/${bookId}`);
      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to find book");
        return;
      }

      const book = await response.json();
      
      // Check if book is already added
      if (selectedBooks.some(selectedBook => selectedBook.id === book.id)) {
        toast.error("Book already added to the issue list");
        return;
      }
      
      setSelectedBooks([...selectedBooks, book]);
      setBookId("");
      toast.success("Book added to the issue list");
    } catch (error) {
      console.error("Error fetching book:", error);
      toast.error("Failed to find book or book not available");
    } finally {
      setSearchingBook(false);
    }
  };

  const removeSelectedBook = (id: string) => {
    setSelectedBooks(selectedBooks.filter(book => book.id !== id));
  };

  const issueBooks = async () => {
    if (!member || selectedBooks.length === 0) {
      toast.error("Member and at least one book are required");
      return;
    }

    setIssuingBooks(true);
    try {
      const response = await fetch("/api/dashboard/issue-books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          memberId: member.id,
          bookIds: selectedBooks.map(book => book.id),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to issue books");
      }

      const issuedBookData = await response.json();
      toast.success("Books issued successfully");
      
      // Clear the selected books and refresh member's books
      setSelectedBooks([]);
      setShowIssueSection(false);
      
      // Add the newly issued book to the list
      setMemberIssuedBooks([issuedBookData, ...memberIssuedBooks]);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to issue books");
      }
    } finally {
      setIssuingBooks(false);
    }
  };

  const markAsCollected = async (itemId: string) => {
    try {
      const response = await fetch(`/api/dashboard/issued-items/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          collected: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark as collected");
      }

      toast.success("Book marked as collected");
      
      // Update the local state
      const updatedIssuedBooks = memberIssuedBooks.map(issuedBook => {
        const updatedItems = issuedBook.items.filter(item => item.id !== itemId);
        // If no more uncollected items, remove the whole issue
        if (updatedItems.length === 0) {
          return null;
        }
        return {
          ...issuedBook,
          items: updatedItems
        };
      }).filter(Boolean) as IssuedBook[];
      
      setMemberIssuedBooks(updatedIssuedBooks);
    } catch (error) {
      console.error("Error marking book as collected:", error);
      toast.error("Failed to mark book as collected");
    }
  };

  const returnBook = async (itemId: string) => {
    try {
      const response = await fetch(`/api/dashboard/issued-items/${itemId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to return book");
      }

      toast.success("Book returned successfully");
      
      // Update the local state
      const updatedIssuedBooks = memberIssuedBooks.map(issuedBook => {
        const updatedItems = issuedBook.items.filter(item => item.id !== itemId);
        // If no more uncollected items, remove the whole issue
        if (updatedItems.length === 0) {
          return null;
        }
        return {
          ...issuedBook,
          items: updatedItems
        };
      }).filter(Boolean) as IssuedBook[];
      
      setMemberIssuedBooks(updatedIssuedBooks);
    } catch (error) {
      console.error("Error returning book:", error);
      toast.error("Failed to return book");
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent, action: () => void) => {
    if (event.key === "Enter") {
      action();
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      {/* Member Search Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Member Search</CardTitle>
          <CardDescription>
            Enter a member ID to search for a member and issue books
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <Label htmlFor="memberId" className="mb-2 block">
                Member ID
              </Label>
              <Input
                id="memberId"
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                onKeyDown={(e) => handleKeyPress(e, searchMember)}
                placeholder="Enter member ID"
              />
            </div>
            <Button 
              onClick={searchMember}
              disabled={loading}
            >
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Member Details Section */}
      {member && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Member Details</CardTitle>
            <CardDescription>
              Information about the selected member
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p><span className="font-medium">ID:</span> {member.id}</p>
                <p><span className="font-medium">Name:</span> {member.name}</p>
                <p><span className="font-medium">Member Type:</span> {member.memberType}</p>
                <p><span className="font-medium">Gender:</span> {member.gender}</p>
              </div>
              <div>
                <p><span className="font-medium">Phone:</span> {member.phoneNumber}</p>
                <p><span className="font-medium">Address:</span> {member.address}</p>
                {member.class && <p><span className="font-medium">Class:</span> {member.class}</p>}
                {member.division && <p><span className="font-medium">Division:</span> {member.division}</p>}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setShowIssueSection(!showIssueSection)}
            >
              {showIssueSection ? "Hide Issue Section" : "Issue Books"}
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Currently Issued Books Section */}
      {member && memberIssuedBooks.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Currently Issued Books</CardTitle>
            <CardDescription>
              Books that have been issued to this member and not collected yet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] rounded-md border p-4">
              {memberIssuedBooks.map((issuedBook) => (
                <div key={issuedBook.id} className="mb-4 p-3 border rounded-md">
                  <div className="mb-2">
                    <p className="text-sm text-muted-foreground">
                      Issued on: {new Date(issuedBook.issueDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm font-medium">
                      Issue ID: {issuedBook.id}
                    </p>
                  </div>
                  <Separator className="my-2" />
                  <div className="space-y-2">
                    {issuedBook.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center bg-muted/20 p-2 rounded-md">
                        <div>
                          <p className="font-medium">{item.book.title}</p>
                          <p className="text-sm">{item.book.author}</p>
                          <Badge variant="outline" className="mt-1">{item.book.category.name}</Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => markAsCollected(item.id)}
                          >
                            Mark as Collected
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => returnBook(item.id)}
                          >
                            Return Book
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Book Issue Section */}
      {member && showIssueSection && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Issue Books</CardTitle>
            <CardDescription>
              Search for books by ID and add them to the issue list
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <Label htmlFor="bookId" className="mb-2 block">
                    Book ID
                  </Label>
                  <Input
                    id="bookId"
                    value={bookId}
                    onChange={(e) => setBookId(e.target.value)}
                    onKeyDown={(e) => handleKeyPress(e, searchBook)}
                    placeholder="Enter book ID"
                  />
                </div>
                <Button 
                  onClick={searchBook}
                  disabled={searchingBook}
                >
                  {searchingBook ? "Searching..." : "Search"}
                </Button>
              </div>

              {selectedBooks.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Selected Books</h3>
                  <ScrollArea className="h-[200px] rounded-md border p-4">
                    {selectedBooks.map((book) => (
                      <div 
                        key={book.id}
                        className="flex justify-between items-center mb-2 p-2 border rounded-md"
                      >
                        <div>
                          <p className="font-medium">{book.title}</p>
                          <p className="text-sm">{book.author}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline">{book.category.name}</Badge>
                            <Badge variant="secondary">Available: {book.availableCopies}</Badge>
                          </div>
                        </div>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => removeSelectedBook(book.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </ScrollArea>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              disabled={selectedBooks.length === 0 || issuingBooks}
              onClick={issueBooks}
              className="w-full"
            >
              {issuingBooks ? "Issuing Books..." : `Issue ${selectedBooks.length} Book${selectedBooks.length !== 1 ? 's' : ''}`}
            </Button>
          </CardFooter>
        </Card>
      )}

      {!member && (
        <div className="text-center p-8 border rounded-lg bg-muted/50">
          <h3 className="font-medium mb-2">Search for a member to begin</h3>
          <p className="text-sm text-muted-foreground">
            Enter a member ID above to search for a member and issue books
          </p>
        </div>
      )}
    </div>
  );
}
