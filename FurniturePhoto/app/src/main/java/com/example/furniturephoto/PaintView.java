package com.example.furniturephoto;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Path;
import android.graphics.PointF;
import android.graphics.PorterDuff;
import android.graphics.PorterDuffXfermode;
import android.graphics.Rect;
import android.util.AttributeSet;
import android.view.View;

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

    public Bitmap resultBitmap;
    public Bitmap cropOriginBitmap;

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

        cropOriginBitmap = Bitmap.createBitmap(screenWidth, screenHeight,
                Bitmap.Config.ARGB_8888);


    }


    public void setImageBitmap(Bitmap bitMap)
    {

        resultBitmap.createBitmap(bitMap);
        this.setImageBitmap(resultBitmap);

    }

    private void clear()
    {
        touchPath.reset();
        touchPoints.clear();
        boundingLeftTop.set(screenWidth, screenHeight);
        boundingRightBottom.set(0, 0);
    }


    @Override
    protected void onDraw(Canvas canvas)
    {

        //copy and paste demo
        //canvas.



        //if still drawing
        if(isdrawing)
        {
            canvas.drawPath(touchPath, touchPaint);

        }else
        {
            touchPaint.setAlpha(100);
            canvas.drawPath(touchPath, touchPaint);

        }

        //if finger up


    }


    public void onDoubleTap(float x, float y)
    {
        clear();
        touchPath.moveTo(x, y);
        touchPoints.add(new PointF(x, y));
    }


    public void onTapMove(float x, float y)
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


    public void onTapUp(float x, float y)
    {
        //get the bitmap from canavas
        //draw the same
//        Canvas mCanvas = new Canvas();
//        mCanvas.setBitmap(resultBitmap);
//
//        Bitmap xx
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
//        Path cropPath = new Path();
//
//        if(touchPoints.size() > 1)
//        {
//            cropPath.moveTo(touchPoints.get(0).x, touchPoints.get(0).y);
//            for(int itrp =1; itrp < touchPoints.size(); itrp++)
//            {
//                cropPath.lineTo(touchPoints.get(itrp).x, touchPoints.get(itrp).y);
//            }
//
//            cropPath.setFillType(Path.FillType.INVERSE_EVEN_ODD);
//
//            Paint paint = new Paint();
//            paint.setAntiAlias(true);
//            paint.setStrokeWidth(20);
//            paint.setColor(Color.GREEN);
//            paint.setAlpha(150);
//            paint.setStyle(Paint.Style.STROKE);
//            paint.setStrokeJoin(Paint.Join.ROUND);
//
//            paint.setXfermode(new PorterDuffXfermode(PorterDuff.Mode.CLEAR));
//
//            mCanvas.drawPath(cropPath, paint);
//        }
//
//        invalidate();

    }


}
