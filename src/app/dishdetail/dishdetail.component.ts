import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { Dish } from '../shared/dish';
import {ActivatedRoute, Params} from '@angular/router';
import {Location}  from '@angular/common';
import {DishService} from '../services/dish.service';
import { switchMap } from 'rxjs/operators';
import { PARAMETERS } from '@angular/core/src/util/decorators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {Comment} from '../shared/comment';
import { MatSliderChange } from '@angular/material';
  

@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss']
})


export class DishdetailComponent implements OnInit {
  
  dish: Dish;
  dishIds:string[];
  prev:string;
  next:string;
  commentForm: FormGroup;
  comments:Comment;
  @ViewChild('cform') commentFormDirective;

  formErrors= {
    'author': '',
    'rating':'',
    'comment':''
  };
  validationMessages= {
    'author':   {'required': ' Name is required',
                  'minlength': 'Name must be at least 2 characters long'},
    'rating':   {'required': 'Rating is required'},
    'comment':   {'required': 'Comment is required'}
  };
  errMess: String;


  constructor(private dishService: DishService,
              private location: Location,
              private route: ActivatedRoute,
              private fb: FormBuilder,
              @Inject ('BaseURL') private BaseURL ) { 
                this.createForm();
              }

 


  ngOnInit() {
    
    this.dishService.getDishIds().subscribe((dishIds)=>this.dishIds=dishIds );
    this.route.params.pipe(switchMap((params:Params)=> this.dishService.getDish(params['id'])))
    .subscribe(dish => {this.dish = dish;
                        this.setPrevNext(dish.id);},
                        errmess => this.errMess= <any> errmess)
  }

  setPrevNext(dishId: string){
    const index = this.dishIds.indexOf(dishId);
    this.prev= this.dishIds[(this.dishIds.length + index -1)% this.dishIds.length];
    this.next= this.dishIds[(this.dishIds.length+index+1)%this.dishIds.length];
  }

  goBack(): void {
    this.location.back();

  }
  createForm(){
    this.commentForm=this.fb.group({
      author:['', [Validators.required,Validators.minLength(2),Validators.pattern]],
      rating:['5',Validators.required],
      comment: ['',Validators.required]
    });

    this.commentForm.valueChanges.subscribe(data => this.onValueChanged(data));

    this.onValueChanged(); // re set form validation messages

  }
  onValueChanged(data?: any){

    if (!this.commentForm) {return;}
    const form = this.commentForm;
    console.log(form.value.rating);
    for (const field in this.formErrors){
      if (this.formErrors.hasOwnProperty(field)){
        // clear previois error message (if any)
        this.formErrors[field]='';
        const control = form.get(field);
        if (control && control.dirty && !control.valid){
          const messages= this.validationMessages[field];
          for (const key in control.errors){
            if (control.errors.hasOwnProperty(key)){
              this.formErrors[field]+= messages[key]+ ' ';
            }
          }
        }
      }
    }

  }

  onSubmit(){
    this.comments= this.commentForm.value;
    this.comments.date=new Date().toISOString();;
    this.dish.comments.push(this.comments);
    this.commentForm.reset({
      author:'',
      rating:'5',
      comment:'',
      
    });
    this.commentFormDirective.resetForm({ rating: 5 });
    
  }

}
