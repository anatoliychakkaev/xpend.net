class HouseBooksController < ApplicationController
  # GET /house_books
  # GET /house_books.xml
  def index
    @house_books = HouseBook.all

    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @house_books }
    end
  end

  # GET /house_books/1
  # GET /house_books/1.xml
  def show
    @house_book = HouseBook.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.xml  { render :xml => @house_book }
    end
  end

  # GET /house_books/new
  # GET /house_books/new.xml
  def new
    @house_book = HouseBook.new

    respond_to do |format|
      format.html # new.html.erb
      format.xml  { render :xml => @house_book }
    end
  end

  # GET /house_books/1/edit
  def edit
    @house_book = HouseBook.find(params[:id])
  end

  # POST /house_books
  # POST /house_books.xml
  def create
    @house_book = HouseBook.new(params[:house_book])

    respond_to do |format|
      if @house_book.save
        format.html { redirect_to(@house_book, :notice => 'House book was successfully created.') }
        format.xml  { render :xml => @house_book, :status => :created, :location => @house_book }
      else
        format.html { render :action => "new" }
        format.xml  { render :xml => @house_book.errors, :status => :unprocessable_entity }
      end
    end
  end

  # PUT /house_books/1
  # PUT /house_books/1.xml
  def update
    @house_book = HouseBook.find(params[:id])

    respond_to do |format|
      if @house_book.update_attributes(params[:house_book])
        format.html { redirect_to(@house_book, :notice => 'House book was successfully updated.') }
        format.xml  { head :ok }
      else
        format.html { render :action => "edit" }
        format.xml  { render :xml => @house_book.errors, :status => :unprocessable_entity }
      end
    end
  end

  # DELETE /house_books/1
  # DELETE /house_books/1.xml
  def destroy
    @house_book = HouseBook.find(params[:id])
    @house_book.destroy

    respond_to do |format|
      format.html { redirect_to(house_books_url) }
      format.xml  { head :ok }
    end
  end
end
