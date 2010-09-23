class OutlayCategoriesController < ApplicationController
  before_filter :authenticate_user!
  before_filter :define_house_book

  # GET /outlay_categories
  # GET /outlay_categories.xml
  def index
    @outlay_categories = @house_book.outlay_categories

    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @outlay_categories }
    end
  end

  # GET /outlay_categories/1
  # GET /outlay_categories/1.xml
  def show
    @outlay_category = @house_book.outlay_categories.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.xml  { render :xml => @outlay_category }
    end
  end

  # GET /outlay_categories/new
  # GET /outlay_categories/new.xml
  def new
    @outlay_category = @house_book.outlay_categories.new

    respond_to do |format|
      format.html # new.html.erb
      format.xml  { render :xml => @outlay_category }
    end
  end

  # GET /outlay_categories/1/edit
  def edit
    @outlay_category = @house_book.outlay_categories.find(params[:id])
  end

  # POST /outlay_categories
  # POST /outlay_categories.xml
  def create
    @outlay_category = @house_book.outlay_categories.new(params[:outlay_category])

    respond_to do |format|
      if @outlay_category.save
        format.html { redirect_to(@outlay_category, :notice => 'Outlay category was successfully created.') }
        format.xml  { render :xml => @outlay_category, :status => :created, :location => @outlay_category }
      else
        format.html { render :action => "new" }
        format.xml  { render :xml => @outlay_category.errors, :status => :unprocessable_entity }
      end
    end
  end

  # PUT /outlay_categories/1
  # PUT /outlay_categories/1.xml
  def update
    @outlay_category = @house_book.outlay_categories.find(params[:id])

    respond_to do |format|
      if @outlay_category.update_attributes(params[:outlay_category])
        format.html { redirect_to(@outlay_category, :notice => 'Outlay category was successfully updated.') }
        format.xml  { head :ok }
      else
        format.html { render :action => "edit" }
        format.xml  { render :xml => @outlay_category.errors, :status => :unprocessable_entity }
      end
    end
  end

  # DELETE /outlay_categories/1
  # DELETE /outlay_categories/1.xml
  def destroy
    @outlay_category = @house_book.outlay_categories.find(params[:id])
    @outlay_category.destroy

    respond_to do |format|
      format.html { redirect_to(outlay_categories_url) }
      format.xml  { head :ok }
    end
  end
end
