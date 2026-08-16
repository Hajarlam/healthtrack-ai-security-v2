package com.healthtrack.mobile.models;
import java.util.List;
public class PageResponse<T> {
    private List<T> content;
    private int totalElements, totalPages, size, number;
    public List<T> getContent()     { return content; }
    public int getTotalElements()   { return totalElements; }
    public int getTotalPages()      { return totalPages; }
}
