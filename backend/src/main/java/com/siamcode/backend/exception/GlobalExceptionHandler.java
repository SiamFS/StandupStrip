package com.siamcode.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import java.time.LocalDateTime;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<ErrorResponse> handleValidationException(
                        MethodArgumentNotValidException ex, WebRequest request) {
                String message = ex.getBindingResult().getFieldErrors().stream()
                                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                                .collect(Collectors.joining(", "));

                ErrorResponse error = new ErrorResponse(
                                message,
                                HttpStatus.BAD_REQUEST.value(),
                                LocalDateTime.now(),
                                request.getDescription(false));
                return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        }

        @ExceptionHandler(ResourceNotFoundException.class)
        public ResponseEntity<ErrorResponse> handleResourceNotFoundException(
                        ResourceNotFoundException ex, WebRequest request) {
                ErrorResponse error = new ErrorResponse(
                                ex.getMessage(),
                                HttpStatus.NOT_FOUND.value(),
                                LocalDateTime.now(),
                                request.getDescription(false));
                return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
        }

        @ExceptionHandler(UnauthorizedException.class)
        public ResponseEntity<ErrorResponse> handleUnauthorizedException(
                        UnauthorizedException ex, WebRequest request) {
                ErrorResponse error = new ErrorResponse(
                                ex.getMessage(),
                                HttpStatus.UNAUTHORIZED.value(),
                                LocalDateTime.now(),
                                request.getDescription(false));
                return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
        }

        @ExceptionHandler(BadRequestException.class)
        public ResponseEntity<ErrorResponse> handleBadRequestException(
                        BadRequestException ex, WebRequest request) {
                ErrorResponse error = new ErrorResponse(
                                ex.getMessage(),
                                HttpStatus.BAD_REQUEST.value(),
                                LocalDateTime.now(),
                                request.getDescription(false));
                return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        }

        @ExceptionHandler(Exception.class)
        public ResponseEntity<ErrorResponse> handleGlobalException(
                        Exception ex, WebRequest request) {
                ErrorResponse error = new ErrorResponse(
                                "An unexpected error occurred",
                                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                                LocalDateTime.now(),
                                request.getDescription(false));
                return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
}
