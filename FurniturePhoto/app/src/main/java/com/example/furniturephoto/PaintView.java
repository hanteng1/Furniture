package com.example.furniturephoto;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Path;
import android.graphics.PointF;
import android.graphics.PorterDuff;
import android.graphics.PorterDuffXfermode;
import android.graphics.Rect;
import android.graphics.drawable.BitmapDrawable;
import android.util.AttributeSet;
import android.view.View;

import java.io.IOException;
import java.net.URL;
import java.util.ArrayList;

public class PaintView extends View {

    private Paint inputPaint = new Paint();
    private int screenWidth, screenHeight;

    private Path touchPath = new Path();
    private Paint touchPaint = new Paint();
    public PointF boundingLeftTop = new PointF();
    private PointF boundingRightBottom = new PointF();
    private ArrayList<PointF> touchPoints = new ArrayList<PointF>();

    private Context mContext;

    private boolean isActive;

    public boolean isdrawing = true;

    public boolean isCropped = false;

    public Bitmap resultBitmap;
    public Bitmap cropOriginBitmap;


    public Bitmap croppedBitmap;


    public PaintView(Context context, AttributeSet attrs)
    {
        super(context, attrs);

        mContext = context;
        inputPaint.setAntiAlias(true);
        inputPaint.setFilterBitmap(true);
        inputPaint.setStrokeWidth(1);
        inputPaint.setColor(Color.RED);
        //inputPaint.setStyle(Paint.Style.STROKE);
        inputPaint.setStrokeJoin(Paint.Join.ROUND);

        //set touch paint, transparent
        touchPaint.setAntiAlias(true);
        touchPaint.setStrokeWidth(20);
        touchPaint.setColor(Color.GREEN);
        touchPaint.setAlpha(150);
        touchPaint.setStyle(Paint.Style.STROKE);
        touchPaint.setStrokeJoin(Paint.Join.ROUND);


    }


    protected int calcFontSize(int size)
    {
        return (int)(size * mContext.getResources().getDisplayMetrics().scaledDensity);
    }

    public void setDimension(int x, int y)
    {
        screenWidth = x;
        screenHeight = y;

        resultBitmap = Bitmap.createBitmap(screenWidth, screenHeight,
                Bitmap.Config.ARGB_8888);


        croppedBitmap = Bitmap.createBitmap(screenWidth, screenHeight,
                Bitmap.Config.ARGB_8888);

        cropOriginBitmap = Bitmap.createBitmap(screenWidth, screenHeight,
                Bitmap.Config.ARGB_8888);

    }


    public void setBitmap(String path)
    {

        Bitmap d = new BitmapDrawable(MainActivity.getSharedInstance().getResources() , path).getBitmap();
        screenWidth = 1080;
        screenHeight = (int) ( d.getHeight() * (1080.0 / d.getWidth()) );
        resultBitmap = Bitmap.createScaledBitmap(d, screenWidth, screenHeight, true);


//        Bitmap background = BitmapFactory.decodeResource(MainActivity.getSharedInstance().getResources(), R.drawable.white);
//        whiteBackground = Bitmap.createScaledBitmap(background, screenWidth, screenHeight, true);
        //Rect rect = new Rect(0, 0, screenWidth, screenHeight);

        croppedBitmap = Bitmap.createBitmap(resultBitmap);

        isCropped = false;

        invalidate();
    }

    public void clear()
    {
        touchPath.reset();
        touchPoints.clear();
        boundingLeftTop.set(screenWidth, screenHeight);
        boundingRightBottom.set(0, 0);

        invalidate();
    }


    @Override
    protected void onDraw(Canvas canvas)
    {

        //copy and paste demo
        if(isCropped)
        {
            canvas.drawBitmap(croppedBitmap, 0, 0, inputPaint);
        }else{

            canvas.drawBitmap(resultBitmap, 0, 0, inputPaint);


            //if still drawing
            if(isdrawing)
            {
                canvas.drawPath(touchPath, touchPaint);

            }else
            {
                touchPaint.setAlpha(100);
                canvas.drawPath(touchPath, touchPaint);

            }
        }



        //if finger up


    }


    public void onDown(float x, float y)
    {
        isdrawing = true;
        touchPath.moveTo(x, y);
        touchPoints.add(new PointF(x, y));
    }


    public void onScroll(float x, float y)
    {
        touchPath.lineTo(x, y);
        touchPoints.add(new PointF(x, y));

        if(x < boundingLeftTop.x)
        {
            boundingLeftTop.x = x;
        }

        if(x > boundingRightBottom.x)
        {
            boundingRightBottom.x = x;
        }

        if(y < boundingLeftTop.y)
        {
            boundingLeftTop.y = y;
        }

        if(y > boundingRightBottom.y)
        {
            boundingRightBottom.y = y;
        }

        invalidate();
    }

    public void onFling()
    {
        isdrawing = false;

    }


    public void makeCrop()
    {
        //get the bitmap from canavas
        //draw the same
        Canvas mCanvas = new Canvas();
        mCanvas.setBitmap(resultBitmap);
//
//        Bitmap background = BitmapFactory.decodeResource(MainActivity.getSharedInstance().getResources(), R.drawable.white);
//        Rect rect = new Rect(0, 0, screenWidth, screenHeight);
//        mCanvas.drawBitmap(background, null, rect, inputPaint);
//        background.recycle();
//        background = null;
//
//
//
//        //crop the bitmap, using the drawing path if possible
//        //save it for later work
//        //https://stackoverflow.com/questions/8993292/cutting-a-multipoint-ploygon-out-of-bitmap-and-placing-it-on-transparency
        Path cropPath = new Path();

        if(touchPoints.size() > 1)
        {
            cropPath.moveTo(touchPoints.get(0).x, touchPoints.get(0).y);
            for(int itrp =1; itrp < touchPoints.size(); itrp++)
            {
                cropPath.lineTo(touchPoints.get(itrp).x, touchPoints.get(itrp).y);
            }

            cropPath.setFillType(Path.FillType.INVERSE_EVEN_ODD);

            Paint paint = new Paint();
            paint.setAntiAlias(true);
            paint.setStrokeWidth(20);
            paint.setColor(Color.GREEN);
            paint.setAlpha(150);
            paint.setStyle(Paint.Style.STROKE);
            paint.setStrokeJoin(Paint.Join.ROUND);

            paint.setXfermode(new PorterDuffXfermode(PorterDuff.Mode.CLEAR));

            mCanvas.drawPath(cropPath, paint);
        }



        //make it white background


        mCanvas = new Canvas();
        mCanvas.setBitmap(croppedBitmap);


        Bitmap background = BitmapFactory.decodeResource(MainActivity.getSharedInstance().getResources(), R.drawable.white);
        Rect rect = new Rect(0, 0, screenWidth, screenHeight);
        mCanvas.drawBitmap(background, null, rect, inputPaint);
        background.recycle();
        background = null;

        mCanvas.drawBitmap(resultBitmap, 0, 0 , inputPaint);


        isCropped = true;





        invalidate();

    }


}
