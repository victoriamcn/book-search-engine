import React, { useState, useEffect } from 'react';
import { useMutation } from "@apollo/client";
//import { GET_ME } from '../utils/queries';
import { SAVE_BOOK } from '../utils/mutations';
import {
  Container,
  Col,
  Form,
  Button,
  Card,
  Row
} from 'react-bootstrap';
import authService from '../utils/auth';
import { searchGoogleBooks } from '../utils/API';
//local storage
import { saveBookIds, getSavedBookIds } from '../utils/localStorage';

//Make sure you keep the logic for saving the book's ID to state in the try...catch block!

const SearchBooks = () => {
  // create state for holding returned google api data
  const [searchedBooks, setSearchedBooks] = useState([]);
  // create state for holding our search field data
  const [searchInput, setSearchInput] = useState('');
  // create state to hold saved bookId values
  const [savedBookIds, setSavedBookIds] = useState(getSavedBookIds());

  const [saveBook] = useMutation(SAVE_BOOK);

   // set up useEffect hook to save `savedBookIds` list to localStorage on component unmount
  // learn more here: https://reactjs.org/docs/hooks-effect.html#effects-with-cleanup
  useEffect(() => {
    return () => saveBookIds(savedBookIds);
  });

  // create method to search for books and set state on form submit
  async function handleFormSubmit(event) {
    event.preventDefault();

    if (!searchInput) {
      return false;
    }

    try {
      // Execute mutation and pass in defined parameter data as variables
      const response = await searchGoogleBooks(searchInput);

      if (!response.ok) {
        throw new Error('Failed to find any results.');
      }

      const { items } = await response.json();

      const bookData = items.map((book) => ({
        bookId: book.id,
        authors: book.volumeInfo.authors || ['No author to display.'],
        title: book.volumeInfo.title,
        description: book.volumeInfo.description,
        image: book.volumeInfo.imageLinks?.thumbnail || '',
      }));
      console.log(bookData)
      setSearchedBooks(bookData);
      setSearchInput('');
    } catch (error) {
      console.error(error);
    }
  }

  // create function to handle saving a book to our database
  const handleSaveBook = async (bookId) => {
    // find the book in `searchedBooks` state by the matching id
    const bookToSave = searchedBooks.find((book) => book.id === bookId);
    console.log(bookToSave)
    // get token
    const token = authService.loggedIn() ? authService.getToken() : null;
    console.log(token)

    if (!token) {
      return false;
    }
    //simplified process
    try {
      await saveBook({
        variables: {InputNewBook: {...bookToSave}},
      });
      // if book successfully saves to user's account, save book id to state
      setSavedBookIds([...savedBookIds, bookToSave.bookId]);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <section>
      <div className="text-light bg-dark p-5">
        <Container>
          <h1>Search for Books!</h1>
          <Form onSubmit={handleFormSubmit}>
              <Col xs={12} md={8}>
                <Form.Control
                  name='searchInput'
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  type='text'
                  size='lg'
                  placeholder='Search for a book'
                />
              </Col>
              <Col xs={12} md={4}>
                <Button type='submit' variant='success' size='lg'>
                  Submit Search
                </Button>
              </Col>
          </Form>
        </Container>
      </div>

      <Container>
        <h2 className='pt-5'>
          {searchedBooks.length
            ? `Viewing ${searchedBooks.length} results:`
            : 'Search for a book to begin'}
        </h2>
        <Row>
          {searchedBooks.map((book) => {
            return (
              <Col as="div"  md="4">
                <Card key={book.bookId} border='dark'>
                  {book.image ? (
                    <Card.Img src={book.image} alt={`The cover for ${book.title}`} variant='top' />
                  ) : null}
                  <Card.Body>
                    <Card.Title>{book.title}</Card.Title>
                    <p className='small'>Authors: {book.authors}</p>
                    <Card.Text>{book.description}</Card.Text>
                    {authService.loggedIn() && (
                      <Button
                        disabled={savedBookIds?.some((savedBookId) => savedBookId === book.savedBookId)}
                        className='btn-block btn-info'
                        onClick={() => handleSaveBook(book.id)}>
                        {savedBookIds?.some((savedBookId) => savedBookId === book.id)
                          ? 'This book has already been saved!'
                          : 'Save this Book!'}
                      </Button>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Container>
    </section>
  );
};

export default SearchBooks;
