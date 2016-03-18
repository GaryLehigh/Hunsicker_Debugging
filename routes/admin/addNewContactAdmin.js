var mysql = require('mysql');
var ejs = require('ejs');
var title = 'Administrator Add New Contact';

var poolH = mysql.createPool({
                             connectionLimit : 100, //important
                             host     : 'localhost',
                             user     : 'Xig514',
                             password : 'some_pass',
                             database : 'Hunsicker',
                             debug    :  false
                             

                             });

var FirstName ="";
var LastName = "";
var PhoneNumber ="";
var EmailAddress = "";
var SiteAddress = "";
var SiteCity = "";
var SiteState ="";
var SiteZip = "";
var ContactStatusID ="";
var MaxContactID = 0;

exports.show=function(request,response)
{
    
    var CompanyID= request.query.CompanyID;
    var CompanyName="";
    if(request.query.CompanyName){
        CompanyName =request.query.CompanyName;
    }
    response.render('addNewContactAdmin',{title:'Add New Contact Admin',CompanyID:CompanyID,CompanyName:CompanyName});
}

exports.handle_Input=function (request,response)
{
    FirstName =request.body.FirstName;
    LastName = request.body.LastName;
    PhoneNumber = request.body.PhoneNumber1+request.body.PhoneNumber2+request.body.PhoneNumber3;
    EmailAddress = request.body.EmailAddress;
    SiteAddress = request.body.SiteAddress;
    SiteCity = request.body.SiteCity;
    SiteState = request.body.SiteState;
    SiteZip = request.body.SiteZip;
    ContactStatusID = request.body.ContactStatusID;
    var CompanyID = request.query.CompanyID;
    var CompanyName = request.query.CompanyName;
    var ContactStatusID_INT=1;
    if(ContactStatusID=='Yes')
    {
        ContactStatusID_INT =1;
        //console.log('checked');
    }
    else
    {
        ContactStatusID_INT = 0;
    }
    
    poolH.getConnection(function(err,connection){
                        if (err) {
                        connection.release();
                        
                        response.json({"code" : 100, "status" : "Error in connection database"});
                        return;
                        }
                        
                        var queryClause2 ="Select ContactID As solution From Contact  Where FirstName  = " +connection.escape(FirstName) + " And  LastName = " +connection.escape(LastName)+"And PhoneNumber="+ connection.escape(PhoneNumber)+"And SiteAddress="+ connection.escape(SiteAddress)+" And CompanyID="+connection.escape(CompanyID)+";";
                        //console.log(queryClause2);
                        //-------------------------------------------------------------------------
                        connection.query(queryClause2,function(err,rows){
                                         
                                         if(!err)
                                         {
                                         
                                         if(rows[0]!=null && rows[0].solution!=undefined)//we found the Contact already in the database
                                         {
                                         //console.log('The ContactID is :' +rows[0].solution);
                                         //it's a new Contact, let's input it into the Contact
                                         response.render('addNewContactAdmin',{title:title, CompanyID:CompanyID,CompanyName:CompanyName,errorMessage:'This Company is already in the database.'});
                                         }
                                         else{
                                         //we did not find that Contact, just insert
                                         var findLargestContactID = "Select Max(ContactID) AS solution from Contact;";
                                         //-----------------------------------------------------------------------------------------------
                                         //find max ContactID
                                         connection.query(findLargestContactID,function(err,rows){
                                                          if (!err)
                                                          {
                                                          if(rows[0]!=null &&rows[0].solution!=undefined)
                                                          {
                                                          
                                                          MaxContactID= rows[0].solution+1;
                                                         // console.log('Now the max CTID is :'+MaxContactID);
                                                          //--------------------------------------------------------------------------------------------------------------
                                                          var insertContact="INSERT INTO Contact Set ? "
                                                          var ContactInput = {ContactID: MaxContactID, FirstName:FirstName,LastName:LastName, SiteAddress:SiteAddress,SiteCity:SiteCity,SiteState:SiteState,SiteZip:SiteZip,PhoneNumber:PhoneNumber ,ContactStatusID:ContactStatusID_INT,CompanyID:CompanyID,EmailAddress:EmailAddress };
                                                          console.log(ContactInput);
                                                          //-----------------------------------------------------------------------------------------------
                                                         
                                                          connection.query(insertContact,ContactInput,function(err,rows){
                                                                           
                                                                           if(!err ) {
                                                                           //we sucessfully input the data into Contact ,then we should take care of the user_Contact;
                                                                           console.log("Succesfully insert Contact!!");
                                                                           jumpToContact(request,response,CompanyID,CompanyName,MaxContactID);
                                                                           }
                                                                           //-----------------------------------------------------------------------------------------------------------------------------------
                                                                           else{
                                                                           
                                                                           response.render('addNewContactAdmin',{ title:title ,CompanyID:CompanyID,errorMessage:'Failed to insert into Contact'});
                                                                           }
                                                                           });
                                                          //-----------------------------------------------------------------------------------------------
                                                          }
                                                          else{response.render('addNewContactAdmin',{ title:title ,CompanyID:CompanyID, errorMessage:'Failed to Select ContactID Max'});}
                                                          }
                                                          });
                                         }
                                         }
                                         else{
                                         response.render('addNewContactAdmin',{ title:title , CompanyID:CompanyID,errorMessage:'Failed to Select Specific ContactID:'+err.code});
                                         }});
                                                                                //-------------------------------------------------------------------------
                        connection.on('error', function(err) {response.json({"code" : 100, "status" : "Error in connection database"});return;});
                        });

}





function jumpToContact(req,res,CompanyID,CompanyName,MaxContactID){
    
    //console.log(CompanyID);
    //console.log(CompanyName);
    var dataForShowing1=new Array();
    
    
    poolH.getConnection(function(err,connection){
                        if (err) {
                        connection.release();
                        res.json({"code" : 100, "status" : "Error in connection database"});
                        return;
                        }
                        var countContactID=0;
                        var ContactID;
                        var ContactName;
                        var queryClause2 = "Select x.countt as countContactID,ContactID as ci, FirstName as fn, LastName as ln, PhoneNumber as pn, EmailAddress as ea, SiteAddress as sa, SiteCity as sc, SiteState as ss,SiteZip as sz, ContactStatusID as csid From Contact,(select count(*) as countt FROM Contact WHERE Contact.CompanyID = "+connection.escape(CompanyID)+") as x  WHERE Contact.CompanyID = " + connection.escape(CompanyID)+"Order By Contact.FirstName, Contact.LastName;";
                        // console.log(queryClause2);
                        connection.query(queryClause2,function(err,rows,fields){
                                         
                                         connection.release();
                                         if(!err)
                                         {
                                         if(rows[0]!=null && rows[0].countContactID !=undefined){
                                         
                                         
                                         countContactID = rows[0].countContactID;
                                         ContactID = new Array(countContactID);
                                         ContactName = new Array(countContactID);
                                         for(var i =0; i <countContactID ; i++)
                                         {
                                         if (rows[i]!=null && rows[i].ci!= undefined)
                                         {
                                         
                                         
                                         dataForShowing1[i]=new Array(12);
                                         ContactID[i]=rows[i].ci;
                                         ContactName[i]=rows[i].fn +" " + rows[i].ln;
                                         dataForShowing1[i][0]=rows[i].ci;
                                         
                                         dataForShowing1[i][1]=rows[i].fn;
                                         dataForShowing1[i][2]=rows[i].ln;
                                         dataForShowing1[i][3]=rows[i].pn;
                                         dataForShowing1[i][4]=rows[i].ea;
                                         dataForShowing1[i][5]=rows[i].sa;
                                         dataForShowing1[i][6]=rows[i].ss;
                                         
                                         dataForShowing1[i][7]=rows[i].sc;
                                         dataForShowing1[i][8]=rows[i].sz;
                                         dataForShowing1[i][9]=rows[i].csid;
                                         dataForShowing1[i][10] = CompanyID;
                                         
                                         dataForShowing1[i][11]=CompanyName;
                                         console.log(CompanyName);
                                         }
                                         }
                                         res.render('chooseExistingContactBasedOnCompanyIDadmin', {h1:'Select Contact',use:{username:'Administrator'},title:'The result of all Contacts based on the selected companyID ',CompanyName:CompanyName, CompanyID: CompanyID, ContactCount:countContactID,ContactID:ContactID,ContactName:ContactName,dataForShowingE:dataForShowing1,selectedContactID :MaxContactID });
                                         }
                                         
                                         
                                         else{
                                         console.log("no contact records");
                                         //Here go direct to add new Contact for this company pape.
                                         res.render('addNewContactAdmin',{title:'Add New Contact Admin',CompanyName:CompanyName,CompanyID:CompanyID,errorMessage:'Error in re-query Contacts'});
                                         }
                                         
                                         }
                                         
                                         else{
                                         console.log('error in Select Contact Info!');
                                         
                                         res.render('errorPage', {usernameE: 'Administrator',h1:'Error in Select Contact Infomation',title:"Error in Select ComapnyInfo",errorMessage :'Error in Select Contact Info!'});
                                         return;
                                         }
                                         
                                         
                                         
                                         
                                         
                                         
                                         });
                        });
}